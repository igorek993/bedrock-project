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

export function UploadForm() {
  const [objectCount, setObjectCount] = useState();
  const [filesSyncedStatus, setFilesSyncedStatus] = useState("");
  const [filesUploading, setFilesUploading] = useState(false);
  const [filesSelected, setFilesSelected] = useState(false);
  const [failedToSyncFilesStatus, setFailedToSyncFilesStatus] = useState([]);
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
      const response = await checkSyncFilesStatus();

      setFailedToSyncFilesStatus(response.failedToSyncFiles);

      if (response.status === "COMPLETE") {
        setFilesSyncedStatus(response.status);
      } else if (response.status === "FAILED") {
        setFilesSyncedStatus(response.status);
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
      const maxSize = 10 * 1024 * 1024; // 10 MB
      const validFiles = [];
      const rejectedFiles = [];

      // Separate valid and rejected files
      Array.from(files).forEach((file) => {
        if (file.size <= maxSize) {
          validFiles.push(file);
        } else {
          rejectedFiles.push(file);
        }
      });

      // Log rejected files to console and alert user
      if (rejectedFiles.length > 0) {
        console.warn("Rejected Files:", rejectedFiles);
        alert(
          `The following files were rejected because they exceed the 10 MB size limit:\n` +
            rejectedFiles
              .map(
                (file) =>
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
    <div className="max-w-lg mx-auto p-6 rounded-lg shadow-lg bg-gradient-to-br from-black to-blue-900 border-2 border-blue-400 text-white h-screen max-h-screen">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          // @ts-ignore
          const formData = new FormData(e.target);
          uploadFiles(formData);
        }}
      >
        <label
          htmlFor="files"
          className="bg-blue-700 hover:bg-blue-800 text-white py-2 px-4 font-sans rounded-md cursor-pointer mt-4 block mb-5"
        >
          {!filesSelected
            ? "Select Files to Upload"
            : `${numberOfSelectedFiles} files to upload`}
        </label>
        <input
          type="file"
          id="files"
          name="files"
          accept=".txt,.md,.html,.doc,.docx,.csv,.xls,.xlsx,.pdf"
          multiple
          onChange={handleFileChange}
          className="hidden"
        />
        <button
          type="submit"
          disabled={!filesSelected || filesUploading}
          className={`py-2 px-4 font-bold rounded-lg transition-all duration-200 shadow ${
            filesSelected
              ? "bg-blue-700 hover:bg-blue-800 text-white"
              : "bg-gray-500 text-gray-300 cursor-not-allowed"
          }`}
        >
          {filesUploading ? (
            <svg
              className="animate-spin h-5 w-7 text-white"
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
      </form>
      {/* Files sync UI logic */}
      <div className="">
        {objectCount == 0 && (
          <div className="flex items-center justify-center m-8">
            No files in the database yet, try to upload your first file!
          </div>
        )}
        {filesSyncedStatus === "IN_PROGRESS" && fileList.length >= 1 && (
          <div className="flex items-center justify-center m-8">
            Processing files
            <CircularProgress className="ml-5" color="success" />
          </div>
        )}
        {filesSyncedStatus === "COMPLETE" &&
          fileList.length >= 1 &&
          failedToSyncFilesStatus.length == 0 && <div>Files are in sync</div>}
        {filesSyncedStatus === "FAILED" && fileList.length >= 1 && (
          <div>Failed to sync</div>
        )}
        {failedToSyncFilesStatus.length > 0 && (
          <div>Files are partially synced</div>
        )}
        {/* End of files sync UI logic */}
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
          Current files count:
          <span style={{ fontSize: "1.2rem" }}>{objectCount}</span>
        </div>
      </div>
      {fileList.length != 0 && (
        <div className="mt-4 overflow-y-auto max-h-[calc(100vh-400px)] border border-blue-400 p-4 rounded-lg bg-gray-800 w-full">
          {/* Header Row */}
          <div className="flex justify-between items-center mb-2 text-white font-bold">
            <span className="w-2/5">Name</span>
            <span className="w-1/5 text-center">Size</span>
            <span className="w-1/3 text-right"></span>
          </div>
          {/* File List */}
          <ul>
            {fileList.map((file, index) => (
              <li
                key={index}
                className="flex justify-between items-center mb-2 text-white"
              >
                {/* File Name Column */}
                <span
                  className="w-2/5 truncate"
                  // @ts-ignore
                  title={file.name}
                >
                  {/* @ts-ignore */}
                  {file.name}
                </span>
                {/* File Size Column */}
                {/* @ts-ignore */}
                <span className="w-1/5 text-center">{file.size} MB</span>
                {/* Action Buttons Column */}
                <div className="w-1/3 flex justify-end gap-2">
                  {/* Download Button */}
                  <button
                    // @ts-ignore
                    onClick={() => handleDownload(file.name)}
                    className="flex items-center justify-center py-1 px-3 bg-blue-700 hover:bg-blue-800 text-white rounded"
                    title="Download"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2m-4-4l-4 4m0 0l-4-4m4 4V4"
                      />
                    </svg>
                  </button>

                  {/* Delete Button */}
                  <button
                    // @ts-ignore
                    onClick={() => handleDelete(file.name)}
                    // @ts-ignore
                    disabled={file.isProcessing}
                    className={`flex items-center justify-center py-1 px-3 rounded ${
                      // @ts-ignore
                      file.isProcessing
                        ? "bg-red-400 cursor-not-allowed"
                        : "bg-red-600 hover:bg-red-700"
                    } text-white`}
                    title="Delete"
                  >
                    {/* @ts-ignore */}
                    {file.isProcessing ? (
                      // Show a loading spinner while processing
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="animate-spin h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 4.75v4.5m0 6v4.5m6-10.5h4.5m-16.5 0H4.75m15.25 6H19.5m-15.5 0H4.75m6 6v-4.5m0-6V4.75"
                        />
                      </svg>
                    ) : (
                      // Delete icon
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
      <button onClick={checkSyncFilesStatus}>TESTTTTTTTTT</button>
    </div>
  );
}
