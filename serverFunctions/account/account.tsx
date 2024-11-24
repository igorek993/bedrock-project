"use server";

import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import parse from "html-react-parser";
import { GetObjectCommand } from "@aws-sdk/client-s3";

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
import { init } from "next/dist/compiled/webpack/webpack";

const clientS3 = new S3Client({
  region: process.env.AWS_REGION,
});

const clientBedrockAgentClient = new BedrockAgentClient({
  region: process.env.AWS_REGION,
});

const clientBedrockAgentRuntimeClient = new BedrockAgentRuntimeClient({
  region: process.env.AWS_REGION,
});

export async function getPresignedUrlUpload(file) {
  try {
    const fileType = file["type"];
    const fileName = file["name"];

    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: fileName,
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

export async function getNumberOfFiles() {
  try {
    const command = new ListObjectsV2Command({
      Bucket: process.env.S3_BUCKET_NAME,
    });

    const response = await clientS3.send(command);

    // Count the objects in the bucket (if any exist)
    const objectCount = response.Contents ? response.Contents.length : 0;

    return {
      status: "success",
      message: `The bucket contains ${objectCount} file(s).`,
      fileCount: objectCount, // Return the count explicitly
    };
  } catch (error) {
    console.error("Error getting number of files:", error);
    return {
      status: "error",
      message: "Error fetching the number of files from the bucket.",
    };
  }
}

async function generatePresignedDownloadUrl(bucketName, key) {
  try {
    // Log the input for debugging purposes
    // console.log(
    //   "Generating presigned URL for bucket:",
    //   bucketName,
    //   "key:",
    //   key
    // );

    // Create a GetObjectCommand
    const command = new GetObjectCommand({ Bucket: bucketName, Key: key });

    // Generate a presigned URL valid for 60 minutes
    const presignedUrl = await getSignedUrl(clientS3, command, {
      expiresIn: 3600,
    });

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
          const downloadUrl = await generatePresignedDownloadUrl(
            process.env.S3_BUCKET_NAME,
            documentName
          );
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

export async function sampleFunction() {
  try {
    return { status: "success", message: "" };
  } catch (error) {
    return { status: "error", message: "Error" };
  }
}
