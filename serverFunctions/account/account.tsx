"use server";

import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
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

const clientS3 = new S3Client({
  region: process.env.AWS_REGION,
});

const clientBedrockAgentClient = new BedrockAgentClient({
  region: process.env.AWS_REGION,
});

export async function getPresignedUrl(file) {
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
      knowledgeBaseId: "CBK4MJJ67Y",
      dataSourceId: "JMZKKETB82",
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

export async function sampleFunction() {
  try {
    return { status: "success", message: "" };
  } catch (error) {
    return { status: "error", message: "Error" };
  }
}
