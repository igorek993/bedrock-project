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

async function generatePresignedDownloadUrl(s3Location) {
  try {
    // Log the input for debugging purposes
    console.log("generatePresignedDownloadUrl called with:", s3Location);

    // Hardcoded URL
    const hardcodedUrl = "https://rupn.online";
    return hardcodedUrl;
  } catch (error) {
    console.error("Error generating download URL:", error);
    return null;
  }
}

export async function generateReferences(initialResponse) {
  try {
    const inititalText = initialResponse.output.text;
    let finalHtml = inititalText;
    const citations = initialResponse.citations;

    if (!citations || citations.length === 0) return inititalText;

    for (let i = 0; i < citations.length; i++) {
      const generatedResponsePart = citations[i].generatedResponsePart;
      const retrievedReferences =
        citations[i].retrievedReferences[i].content.text;
      console.log(`kakaka, ${retrievedReferences}`);

      // Extract the citation text
      const citationText = generatedResponsePart.textResponsePart.text;

      // Append [x] where x is the citation number
      finalHtml = finalHtml.replace(
        citationText,
        `${citationText} <span class="hover-target">[${i + 1}]
          <div class="hover-div">
            ${
              retrievedReferences.length > 200
                ? retrievedReferences.substring(0, 200) + "..."
                : retrievedReferences
            }
          </div>
        </span>`
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

    // const initialText = response.output?.text;

    const finalHtml = await generateReferences(response);

    // const finalHtml = parse(
    //   `<h1>${initialText}</h1><button>puFDJSAKLJL<button/>`
    // );

    console.log("--------------------------------------------");
    console.log(response.output);
    console.log("--------------------------------------------");
    console.log(response.citations[0].generatedResponsePart);
    console.log("--------------------------------------------");
    console.log(response.citations[0].retrievedReferences);
    console.log("--------------------------------------------");
    // console.log(response.citations[0].retrievedReferences[0].location);
    console.log("--------------------------------------------");
    // console.log(response.citations[0].retrievedRefer ences);

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
