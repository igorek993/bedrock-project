"use server";

import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import parse from "html-react-parser";
import { GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { currentUser } from "@clerk/nextjs/server";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { GetCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import he from "he";

import {
  S3Client,
  PutObjectCommand,
  ListObjectsV2Command,
} from "@aws-sdk/client-s3";

import {
  BedrockAgentClient,
  GetKnowledgeBaseCommand,
  GetIngestionJobCommand,
  GetDataSourceCommand,
  ListIngestionJobsCommand,
  StartIngestionJobCommand,
} from "@aws-sdk/client-bedrock-agent";

import {
  BedrockAgentRuntimeClient,
  RetrieveAndGenerateCommand,
} from "@aws-sdk/client-bedrock-agent-runtime";

// Ensure credentials are defined
if (!process.env.ACCESS_KEY_ID || !process.env.SECRET_ACCESS_KEY) {
  throw new Error("Missing AWS credentials in environment variables");
}

// Common credentials object
const awsCredentials = {
  accessKeyId: process.env.ACCESS_KEY_ID,
  secretAccessKey: process.env.SECRET_ACCESS_KEY,
};

// Initialize S3Client
const clientS3 = new S3Client({
  region: "ap-southeast-2",
  credentials: awsCredentials,
});

// Initialize BedrockAgentClient
const clientBedrockAgentClient = new BedrockAgentClient({
  region: "ap-southeast-2",
  credentials: awsCredentials,
});

// Initialize BedrockAgentRuntimeClient
const clientBedrockAgentRuntimeClient = new BedrockAgentRuntimeClient({
  region: "ap-southeast-2",
  credentials: awsCredentials,
});

// Initialize DynamoDBClient
const clientDynamoDB = new DynamoDBClient({
  region: "ap-southeast-2",
  credentials: awsCredentials,
});
const clientDynamoDBDocumentClient =
  DynamoDBDocumentClient.from(clientDynamoDB);

export async function authExample() {
  try {
    const user = await currentUser();
    // console.log(user?.emailAddresses[0].emailAddress);
    // console.log(user?.firstName);
    return { status: "success", message: "" };
  } catch (error) {
    return { status: "error", message: "Error" };
  }
}

async function getCurrentUserInfoFromDynamoDb() {
  try {
    const user = await currentUser();
    if (!user || !user.emailAddresses?.[0]?.emailAddress) {
      throw new Error("Unable to retrieve user email address");
    }
    const userId = user.id;

    const TABLE_NAME = process.env.USER_INFO_DYNAMO_DB_TABLE;

    if (!userId) {
      throw new Error("UserId is required");
    }

    const params = {
      TableName: TABLE_NAME,
      Key: {
        UserId: userId, // Partition key to retrieve the user
      },
    };

    const command = new GetCommand(params);
    const result = await clientDynamoDBDocumentClient.send(command);

    if (!result.Item) {
      return {
        status: "error",
        message: `User with UserId "${userId}" not found.`,
      };
    }

    return {
      status: "success",
      data: result.Item,
    };
  } catch (error) {
    console.error("Error retrieving user from DynamoDB:", error);
    return {
      status: "error",
      message: `Failed to retrieve user with UserId: ${error}`,
    };
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
    const userInfo = await getCurrentUserInfoFromDynamoDb();
    const userDataSourceId = userInfo.data?.DataSourceId;
    const userKnowledgeBaseId = userInfo.data?.KnowledgeBaseId;

    const command = new StartIngestionJobCommand({
      knowledgeBaseId: userKnowledgeBaseId,
      dataSourceId: userDataSourceId,
    });

    const response = await clientBedrockAgentClient.send(command);

    // console.log(response);

    return { status: "success", message: "" };
  } catch (error) {
    console.log(error);
    return { status: "error", message: "Error" };
  }
}

async function parseFailedToSyncFilesStatus(
  knowledgeBaseId,
  dataSourceId,
  ingestionJobId
) {
  try {
    const user = await currentUser();

    if (!user || !user.emailAddresses?.[0]?.emailAddress) {
      throw new Error("Unable to retrieve user email address");
    }
    const userId = user.id;

    if (!process.env.S3_BUCKET_NAME) {
      throw new Error(
        "S3 bucket name is not defined in the environment variables."
      );
    }
    const bucketName = process.env.S3_BUCKET_NAME;

    // Correct prefix construction
    const prefix = `s3://${bucketName}/${userId}/`;
    // console.log("Constructed Prefix:", prefix);

    const input = {
      knowledgeBaseId,
      dataSourceId,
      ingestionJobId,
    };

    const command = new GetIngestionJobCommand(input);
    const response = await clientBedrockAgentClient.send(command);

    if (!response || !response.ingestionJob) {
      throw new Error("Failed to fetch ingestion job details.");
    }

    const failedToSyncFilesStatus = response.ingestionJob.failureReasons;
    if (!failedToSyncFilesStatus || failedToSyncFilesStatus.length === 0) {
      return [];
    }

    const splitFailureReasonsString = failedToSyncFilesStatus[0]
      ?.slice(2, -2)
      .split(/,(?![^[]*\])/);

    const result = splitFailureReasonsString.map((reason) => {
      try {
        const filesMatch = reason.match(/\[Files: ([^\]]+)\]/); // Extract files inside [Files: ...]
        const rawFiles = filesMatch ? filesMatch[1].split(", ") : [];

        // Clean up file paths
        const files = rawFiles.map((file) => {
          if (file.startsWith(prefix)) {
            const cleanedFile = file.slice(prefix.length); // Remove the prefix
            // console.log("Original file:", file, "Cleaned file:", cleanedFile); // Log for debugging
            return cleanedFile;
          }
          // console.log("File did not match prefix:", file);
          return file; // Return unmodified if it doesn't match the prefix
        });

        const errorMessage = reason.replace(/\[Files: [^\]]+\]/, "").trim(); // Remove the files part

        return { errorMessage, files };
      } catch (innerError) {
        console.error("Error parsing a failure reason:", innerError);
        return {
          errorMessage: "Unknown error while parsing failure reason.",
          files: [],
        };
      }
    });

    return result;
  } catch (error) {
    console.error("Error in parseFailedToSyncFilesStatus:", error);
    throw new Error(
      "Failed to parse failed-to-sync files status. Please try again later."
    );
  }
}

export async function checkSyncFilesStatus() {
  try {
    const userInfo = await getCurrentUserInfoFromDynamoDb();
    const userDataSourceId = userInfo.data?.DataSourceId;
    const userKnowledgeBaseId = userInfo.data?.KnowledgeBaseId;
    let failedToSyncFiles = [];

    const input = {
      knowledgeBaseId: userKnowledgeBaseId,
      dataSourceId: userDataSourceId,
      maxResults: 3,
      sortBy: {
        attribute: "STARTED_AT",
        order: "DESCENDING",
      },
    };
    // @ts-ignore
    const command = new ListIngestionJobsCommand(input);
    const response = await clientBedrockAgentClient.send(command);
    // @ts-ignore
    const status = response.ingestionJobSummaries[0].status;
    // @ts-ignore
    const ingestionJobId = response.ingestionJobSummaries[0].ingestionJobId;

    // Check if there are any failed files and if yes, return the list of failed files and the reason
    if (
      // @ts-ignore
      response.ingestionJobSummaries[0].statistics?.numberOfDocumentsFailed >= 1
    ) {
      // @ts-ignore
      failedToSyncFiles = await parseFailedToSyncFilesStatus(
        userKnowledgeBaseId,
        userDataSourceId,
        ingestionJobId
      );
      failedToSyncFiles =
        failedToSyncFiles.find(
          (entry) =>
            // @ts-ignore
            entry.errorMessage.includes("no text content found")
          // @ts-ignore
        )?.files || [];
    }

    // console.log(failedToSyncFiles);

    return { status: status, failedToSyncFiles: failedToSyncFiles };
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
      // @ts-ignore
      name: item.Key.replace(`${userId}/`, ""), // Remove the user's email prefix
      // @ts-ignore
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
  const escapedBody = he.encode(body);
  const truncatedName = name.length > 30 ? name.substring(0, 30) + "..." : name;

  return `<span class="reference-hover-target">[${count}]
<div class="reference-hover-div">
  ${escapedBody}
  <a class="reference-hover-link" target="_blank" href="${url}">Download source: ${truncatedName}</a>
</div>
</span>`;
}

export async function generateReferences(initialResponse) {
  try {
    const inititalText = initialResponse.output.text;
    let finalHtml = inititalText;

    let citationCount = 1; // Start citation count

    for (const citation of initialResponse.citations) {
      // Process references sequentially to maintain order
      const references = await Promise.all(
        citation.retrievedReferences.map(async (reference, index) => {
          const fullBody = reference.content.text;
          const body =
            fullBody.length > 200
              ? fullBody.substring(0, 200) + "..."
              : fullBody;

          const documentName = getS3DocumentName(
            reference.location.s3Location.uri
          );
          const downloadUrl = await generatePresignedDownloadUrl(documentName);

          // Use citationCount for overall numbering
          const hoverMarkup = getReferenceHover(
            citationCount + index, // Use index-based calculation
            body,
            downloadUrl,
            documentName
          );

          return hoverMarkup;
        })
      );

      // Increment citationCount by the number of references processed
      citationCount += citation.retrievedReferences.length;

      // Replace citation text with references
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
    const userInfo = await getCurrentUserInfoFromDynamoDb();
    const userKnowledgeBaseId = userInfo.data?.KnowledgeBaseId;

    const input = {
      input: { text: message },
      retrieveAndGenerateConfiguration: {
        type: "KNOWLEDGE_BASE", // or "EXTERNAL_SOURCES"
        knowledgeBaseConfiguration: {
          knowledgeBaseId: userKnowledgeBaseId, // Replace with your actual Knowledge Base ID
          modelArn:
            "arn:aws:bedrock:ap-southeast-2::foundation-model/anthropic.claude-3-haiku-20240307-v1:0", // Replace with your model ARN
        },
      },
    };
    // @ts-ignore
    const command = new RetrieveAndGenerateCommand(input);
    const response = await clientBedrockAgentRuntimeClient.send(command);

    // console.log("received response");
    const finalHtml = await generateReferences(response);
    // console.log("end");

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
