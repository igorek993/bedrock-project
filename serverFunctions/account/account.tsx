"use server";

import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import parse from "html-react-parser";
import { GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { auth, currentUser } from "@clerk/nextjs/server";

import {
  S3Client,
  PutObjectCommand,
  ListObjectsV2Command,
} from "@aws-sdk/client-s3";

import {
  BedrockAgentClient,
  GetKnowledgeBaseCommand,
  GetDataSourceCommand,
  StartIngestionJobCommand,
} from "@aws-sdk/client-bedrock-agent";

import {
  BedrockAgentRuntimeClient,
  RetrieveAndGenerateCommand,
} from "@aws-sdk/client-bedrock-agent-runtime";

const clientS3 = new S3Client({
  region: process.env.AWS_REGION,
});

const clientBedrockAgentClient = new BedrockAgentClient({
  region: process.env.AWS_REGION,
});

const clientBedrockAgentRuntimeClient = new BedrockAgentRuntimeClient({
  region: process.env.AWS_REGION,
});

export async function authExample() {
  try {
    const user = await currentUser();
    console.log(user?.emailAddresses[0].emailAddress);
    console.log(user?.firstName);
    return { status: "success", message: "" };
  } catch (error) {
    return { status: "error", message: "Error" };
  }
}

export async function getPresignedUrlUpload(file) {
  try {
    const user = await currentUser();
    if (!user || !user.emailAddresses?.[0]?.emailAddress) {
      throw new Error("Unable to retrieve user email address");
    }

    const userId = user.id;

    const fileType = file["type"];
    const fileName = file["name"];

    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: `${userId}/${fileName}`,
      ContentType: fileType,
    });

    const url = await getSignedUrl(clientS3, command, { expiresIn: 60 });

    return { url: url, status: "success", message: "File has been uploaded" };
  } catch (error) {
    return { status: "error", message: "Error" };
  }
}

export async function syncFiles() {
  try {
    const command = new StartIngestionJobCommand({
      knowledgeBaseId: process.env.KNOWLEDGEBASE_ID,
      dataSourceId: process.env.DATASOURCE_ID,
    });

    const response = await clientBedrockAgentClient.send(command);

    console.log(response);

    return { status: "success", message: "" };
  } catch (error) {
    console.log(error);
    return { status: "error", message: "Error" };
  }
}

export async function listFiles() {
  try {
    const user = await currentUser();
    if (!user || !user.emailAddresses?.[0]?.emailAddress) {
      throw new Error("Unable to retrieve user email address");
    }

    const userId = user.id;

    const command = new ListObjectsV2Command({
      Bucket: process.env.S3_BUCKET_NAME,
      Prefix: userId,
    });

    const response = await clientS3.send(command);

    if (!response.Contents) {
      return {
        status: "success",
        fileCount: 0,
        files: [],
      };
    }

    // Map the list of objects to include name (without user email prefix) and size in MB
    const files = response.Contents.map((item) => ({
      name: item.Key.replace(`${userId}/`, ""), // Remove the user's email prefix
      size: (item.Size / (1024 * 1024)).toFixed(2), // File size in MB, formatted to 2 decimal places
    }));

    return {
      status: "success",
      fileCount: files.length, // Return the count explicitly
      files,
    };
  } catch (error) {
    console.error("Error listing files from S3:", error);
    return {
      status: "error",
      message: "Error listing files from S3",
    };
  }
}

export async function generatePresignedDownloadUrl(key) {
  try {
    const user = await currentUser();
    if (!user || !user.emailAddresses?.[0]?.emailAddress) {
      throw new Error("Unable to retrieve user email address");
    }

    const userId = user.id;

    // Create a GetObjectCommand
    const command = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: `${userId}/${key}`,
    });

    // Generate a presigned URL valid for 60 minutes
    const presignedUrl = await getSignedUrl(clientS3, command, {
      expiresIn: 3600,
    });

    // console.log(presignedUrl);
    return presignedUrl;
  } catch (error) {
    console.error("Error generating presigned download URL:", error);
    return null;
  }
}

function getS3DocumentName(s3ObjectString) {
  if (!s3ObjectString.startsWith("s3://")) {
    throw new Error("Invalid S3 object string format.");
  }

  // Extract the document name
  const parts = s3ObjectString.split("/");
  return parts[parts.length - 1];
}

function getReferenceHover(count, body, url, name) {
  return `<span class="reference-hover-target">[${count}]
<div class="reference-hover-div">
  ${body}
  <a class="reference-hover-link" target="_blank" href="${url}">Скачать документ: ${name}</a>
</div>
</span>`;
}

export async function generateReferences(initialResponse) {
  try {
    const inititalText = initialResponse.output.text;
    let finalHtml = inititalText;
    // console.log(JSON.stringify(initialResponse, undefined, 2));

    let citationCount = 1;
    for (const citation of initialResponse.citations) {
      const references = await Promise.all(
        citation.retrievedReferences.map(async (reference) => {
          const fullBody = reference.content.text;
          const body =
            fullBody.length > 200
              ? fullBody.substring(0, 200) + "..."
              : fullBody;

          const documentName = getS3DocumentName(
            reference.location.s3Location.uri
          );
          const downloadUrl = await generatePresignedDownloadUrl(documentName);
          reference = getReferenceHover(
            citationCount,
            body,
            downloadUrl,
            documentName
          );
          citationCount++;

          return reference;
        })
      );
      const citationText = citation.generatedResponsePart.textResponsePart.text;
      finalHtml = finalHtml.replace(
        citationText,
        citationText + references.join(" ")
      );
    }

    return parse(finalHtml);
  } catch (error) {
    console.error("Error in generateReferences:", error);
    return "Error generating references";
  }
}

export async function processClientMessage(message: string) {
  try {
    const input = {
      input: { text: message },
      retrieveAndGenerateConfiguration: {
        type: "KNOWLEDGE_BASE", // or "EXTERNAL_SOURCES"
        knowledgeBaseConfiguration: {
          knowledgeBaseId: process.env.KNOWLEDGEBASE_ID, // Replace with your actual Knowledge Base ID
          // modelArn:
          //   "arn:aws:bedrock:ap-southeast-2:665628331607:inference-profile/apac.anthropic.claude-3-5-sonnet-20240620-v1:0",
          modelArn:
            "arn:aws:bedrock:ap-southeast-2::foundation-model/anthropic.claude-3-haiku-20240307-v1:0", // Replace with your model ARN
        },
      },
    };
    // @ts-ignore
    const command = new RetrieveAndGenerateCommand(input);
    const response = await clientBedrockAgentRuntimeClient.send(command);

    console.log("received response");
    const finalHtml = await generateReferences(response);
    console.log("end");

    return {
      text: finalHtml,
      ok: true,
    };
  } catch (error) {
    console.log(error);
    return { ok: false };
  }
}

export async function deleteFile(fileName) {
  try {
    const user = await currentUser();
    if (!user || !user.emailAddresses?.[0]?.emailAddress) {
      throw new Error("Unable to retrieve user email address");
    }

    const userId = user.id;

    // Define the command to delete the file
    const command = new DeleteObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME, // The S3 bucket name
      Key: `${userId}/${fileName}`, // The file name (object key)
    });

    // Send the command to S3
    const response = await clientS3.send(command);

    return {
      status: "success",
      message: `File "${fileName}" successfully deleted.`,
    };
  } catch (error) {
    console.error("Error deleting file from S3:", error);

    return {
      status: "error",
      // @ts-ignore
      message: `Error deleting file "${fileName}" from S3: ${error.message}`,
    };
  }
}

export async function sampleFunction() {
  try {
    console.log("HERE,HERE,HERE,HERE,HERE,HERE,HERE,HERE");
    console.log(process.env.S3_BUCKET_NAME);
    console.log("HERE,HERE,HERE,HERE,HERE,HERE,HERE,HERE");
    return { status: "success", message: "" };
  } catch (error) {
    return { status: "error", message: "Error" };
  }
}
