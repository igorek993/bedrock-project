import {
  getPresignedUrlUpload,
  listFiles,
  syncFiles,
  generatePresignedDownloadUrl,
  deleteFile,
  checkSyncFilesStatus,
} from "@/serverFunctions/account/account";
import { useState, useEffect } from "react";
import CircularProgress from "@mui/material/CircularProgress";
import FilesList from "./UploadFormElements/FilesList";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import WarningIcon from "@mui/icons-material/Warning";

export function UploadForm() {
  const [objectCount, setObjectCount] = useState();
  const [filesSyncedStatus, setFilesSyncedStatus] = useState();
  const [filesUploading, setFilesUploading] = useState(false);
  const [filesSelected, setFilesSelected] = useState(false);
  const [failedToSyncFiles, setfailedToSyncFiles] = useState([]);
  const [syncingFiles, setSyncingFiles] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [numberOfSelectedFiles, setNumberOfSelectedFiles] = useState(0);

  async function fetchFileCount() {
    const response = await listFiles();
    if (response.status === "success") {
      // @ts-ignore
      setObjectCount(response.fileCount);
      // @ts-ignore
      setFileList(response.files);
    } else {
      // @ts-ignore
      setObjectCount("Error");
    }
  }

  async function handleDownload(fileName) {
    const url = await generatePresignedDownloadUrl(fileName);
    // @ts-ignore
    window.open(url, "_blank");
  }

  async function handleDelete(fileName) {
    try {
      // Update the file's processing state
      const updatedFileList = fileList.map((file) =>
        // @ts-ignore
        file.name === fileName ? { ...file, isProcessing: true } : file
      );
      // @ts-ignore
      setFileList(updatedFileList);

      // Call the delete API
      const response = await deleteFile(fileName);
      if (response.status === "success") {
        // Add a fade-out effect before removing the file
        const updatedFileListWithAnimation = fileList.map((file) =>
          // @ts-ignore
          file.name === fileName ? { ...file, isDeleting: true } : file
        );
        // @ts-ignore
        setFileList(updatedFileListWithAnimation);

        // Wait for the animation to complete before updating the state
        setTimeout(() => {
          // @ts-ignore
          setFileList((prev) => prev.filter((file) => file.name !== fileName));
        }, 100);
      }
      syncFiles();
      setFilesSyncedStatus("IN_PROGRESS");
      localCheckSyncFilesStatus();
      fetchFileCount();
    } catch (error) {
      console.error("An error occurred while deleting the file:", error);
      // Reset the processing state in case of an error
      // @ts-ignore
      setFileList((prev) =>
        prev.map((file) =>
          // @ts-ignore
          file.name === fileName ? { ...file, isProcessing: false } : file
        )
      );
    }
  }

  async function localCheckSyncFilesStatus() {
    try {
      setSyncingFiles(true);
      const response = await checkSyncFilesStatus();

      if (response.status === "COMPLETE") {
        setFilesSyncedStatus(response.status);
        // @ts-ignore
        setfailedToSyncFiles(response.failedToSyncFiles);
        setSyncingFiles(false);
      } else if (response.status === "FAILED") {
        setFilesSyncedStatus(response.status);
        // @ts-ignore
        setfailedToSyncFiles(response.failedToSyncFiles);
        setSyncingFiles(false);
      } else {
        setFilesSyncedStatus("IN_PROGRESS");

        // Retry after 5 seconds
        setTimeout(() => {
          localCheckSyncFilesStatus();
        }, 3000);
      }
    } catch (error) {
      console.error("Error checking file sync status:", error);
    }
  }

  async function uploadFiles(formData) {
    if (!formData.getAll("files")[0]?.name) return;
    setFilesUploading(true);
    const files = formData.getAll("files");
    for (const file of files) {
      const presignedUrl = await getPresignedUrlUpload(file);
      const fileUpload = await fetch(presignedUrl.url!, {
        method: "PUT",
        body: file,
      });
      console.log(fileUpload);
    }
    setFilesUploading(false);
    setFilesSelected(false);
    fetchFileCount();
    syncFiles();
    setFilesSyncedStatus("IN_PROGRESS");
    localCheckSyncFilesStatus();
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const maxSize = 45 * 1024 * 1024; // 10 MB
      const validFiles = [];
      const rejectedFiles = [];

      // Separate valid and rejected files
      Array.from(files).forEach((file) => {
        if (file.size <= maxSize) {
          // @ts-ignore
          validFiles.push(file);
        } else {
          // @ts-ignore
          rejectedFiles.push(file);
        }
      });

      // Log rejected files to console and alert user
      if (rejectedFiles.length > 0) {
        console.warn("Rejected Files:", rejectedFiles);
        alert(
          `The following files were rejected because they exceed the 45 MB size limit:\n` +
            rejectedFiles
              .map(
                (file) =>
                  // @ts-ignore
                  `- ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`
              )
              .join("\n")
        );
      }

      setFilesSelected(validFiles.length > 0);
      setNumberOfSelectedFiles(validFiles.length);

      // Reset file input if all files are invalid
      if (validFiles.length === 0) {
        event.target.value = ""; // Reset file input
      }

      console.log("Valid Files:", validFiles);
    }
  };

  useEffect(() => {
    fetchFileCount();
    localCheckSyncFilesStatus();
  }, []);

  return (
    <div className="mx-auto p-6 rounded-lg shadow-lg bg-gradient-to-br from-black to-blue-900 border-2 border-blue-400 text-white h-[83vh]">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          // @ts-ignore
          const formData = new FormData(e.target);
          uploadFiles(formData);
        }}
      >
        <div className="flex gap-4 items-center">
          <label
            htmlFor="files"
            className="bg-blue-700 hover:bg-blue-800 text-white py-2 px-4 font-sans rounded-md cursor-pointer flex-1 text-center"
          >
            {!filesSelected
              ? "Select Files to Upload"
              : `${numberOfSelectedFiles} files to upload`}
          </label>
          <button
            type="submit"
            disabled={!filesSelected || filesUploading}
            className={`py-2 px-4 font-bold rounded-md flex-1 text-center transition-all duration-200 shadow ${
              filesSelected
                ? "bg-blue-700 hover:bg-blue-800 text-white"
                : "bg-gray-500 text-gray-300 cursor-not-allowed"
            }`}
          >
            {filesUploading ? (
              <svg
                className="animate-spin h-5 w-7 text-white mx-auto"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8H4z"
                ></path>
              </svg>
            ) : (
              "Upload"
            )}
          </button>
        </div>
        <input
          type="file"
          id="files"
          name="files"
          accept=".txt,.md,.html,.doc,.docx,.csv,.xls,.xlsx,.pdf"
          multiple
          onChange={handleFileChange}
          className="hidden"
        />
      </form>

      {/* Files sync UI logic */}
      <div className="flex justify-self-center items-center">
        {objectCount == 0 && (
          <div className="flex items-center justify-center m-8 p-4 rounded-lg text-center">
            No files in the database yet, try to upload your first file!
          </div>
        )}
        {filesSyncedStatus === "IN_PROGRESS" && fileList.length >= 1 && (
          <div className="flex items-center justify-center m-8 p-4 rounded-lg text-center">
            Processing files
            <CircularProgress className="ml-2" color="primary" />
          </div>
        )}
        {filesSyncedStatus === "COMPLETE" &&
          fileList.length >= 1 &&
          failedToSyncFiles.length == 0 && (
            <div className="flex items-center justify-center m-8 p-4 rounded-lg text-center">
              <CheckCircleIcon className="mr-2 text-green-500" />
              Files are in sync
            </div>
          )}
        {filesSyncedStatus === "FAILED" && fileList.length >= 1 && (
          <div className="flex items-center justify-center m-8 p-4 rounded-lg text-center">
            <ErrorIcon className="mr-2 text-red-500" />
            Failed to sync
          </div>
        )}
        {failedToSyncFiles.length > 0 && !syncingFiles && (
          <div className="flex items-center justify-center m-8 p-4 rounded-lg text-center">
            <WarningIcon className="mr-2 text-yellow-500" />
            Files are partially synced
          </div>
        )}

        {/* Current files count */}
        {filesSyncedStatus !== undefined && filesSyncedStatus !== null && (
          <div
            className="text-center px-4 py-2 rounded-lg"
            style={{
              background: "rgba(255, 255, 255, 0.1)",
              border: "2px solid #42a5f5",
              color: "#64b5f6",
              fontWeight: "bold",
              fontSize: "1.1rem",
            }}
          >
            Current files count:&nbsp;
            <span style={{ fontSize: "1.2rem" }}>{objectCount}</span>
          </div>
        )}
      </div>

      {fileList.length != 0 && (
        <FilesList
          fileList={fileList}
          failedToSyncFiles={failedToSyncFiles}
          handleDownload={handleDownload}
          handleDelete={handleDelete}
        />
      )}
    </div>
  );
}
