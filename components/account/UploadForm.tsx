import {
  getPresignedUrlUpload,
  listFiles,
  syncFiles,
  generatePresignedDownloadUrl,
} from "@/serverFunctions/account/account";
import { useState, useEffect } from "react";

export function UploadForm() {
  const [objectCount, setObjectCount] = useState();
  const [filesSynced, setFilesSynced] = useState(false);
  const [loading, setLoading] = useState(false);
  const [filesSelected, setFilesSelected] = useState(false);
  const [fileList, setFileList] = useState([]);

  async function fetchFileCount() {
    const response = await listFiles();
    if (response.status === "success") {
      setObjectCount(response.fileCount);
      setFileList(response.files);
    } else {
      setObjectCount("Error");
    }
  }

  async function handleDownload(fileName) {
    const url = await generatePresignedDownloadUrl(fileName);
    window.open(url, "_blank");
  }

  async function localSyncFiles() {
    setLoading(true);
    const response = await syncFiles();
    if (response.status === "success") {
      setFilesSynced(true);
      setLoading(false);
    } else {
      setFilesSynced(false);
      setLoading(false);
    }
  }

  async function uploadFiles(formData) {
    if (!formData.getAll("files")[0]?.name) return;
    const files = formData.getAll("files");
    for (const file of files) {
      const presignedUrl = await getPresignedUrlUpload(file);
      const fileUpload = await fetch(presignedUrl.url!, {
        method: "PUT",
        body: file,
      });
      console.log(fileUpload);
    }
    fetchFileCount();
  }

  function handleFileChange(event) {
    const files = event.target.files;
    setFilesSelected(files.length > 0);
  }

  useEffect(() => {
    fetchFileCount();
  }, []);

  return (
    <div
      className="max-w-lg mx-auto p-6 rounded-lg shadow"
      style={{
        background: "linear-gradient(145deg, #000000, #003366)",
        border: "2px solid #64b5f6",
        color: "white",
        boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.5)",
      }}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.target);
          uploadFiles(formData);
        }}
        className="flex flex-col space-y-4"
        style={{ fontFamily: "Arial, sans-serif" }}
      >
        <label
          htmlFor="files"
          className="text-lg font-medium"
          style={{ color: "#ffffff" }}
        >
          Select Files to Upload
        </label>
        <div className="relative">
          <input
            type="file"
            id="files"
            name="files"
            accept="*"
            multiple
            onChange={handleFileChange}
            className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div
            className="w-full py-2 px-4 text-center rounded-lg"
            style={{
              background: "#2a2a2a",
              border: "2px solid #1976d2",
              color: "#ffffff",
              fontWeight: "bold",
            }}
          >
            Choose Files
          </div>
        </div>
        <button
          type="submit"
          disabled={!filesSelected}
          className={`py-2 px-4 font-bold rounded-lg ${
            filesSelected
              ? "bg-blue-700 hover:bg-blue-800 text-white"
              : "bg-gray-500 text-gray-300 cursor-not-allowed"
          }`}
          style={{
            transition: "all 0.2s ease-in-out",
            boxShadow: "0px 2px 12px rgba(0, 0, 0, 0.2)",
          }}
        >
          Upload
        </button>
      </form>
      <div className="flex flex-col space-y-2 mt-4 items-center">
        {filesSynced && (
          <div
            className="text-center px-4 py-2 mt-2 rounded-lg"
            style={{
              background: "rgba(0, 200, 83, 0.1)",
              border: "2px solid #66bb6a",
              color: "#81c784",
              fontWeight: "bold",
              fontSize: "1.1rem",
            }}
          >
            Files are in sync
          </div>
        )}
        {!filesSynced && !loading && (
          <button
            onClick={localSyncFiles}
            className="py-2 px-4 font-bold rounded-lg bg-blue-700 hover:bg-blue-800 text-white"
            style={{
              transition: "all 0.2s ease-in-out",
              boxShadow: "0px 2px 12px rgba(0, 0, 0, 0.2)",
            }}
          >
            Sync Files
          </button>
        )}
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
          Current files count:{" "}
          <span style={{ fontSize: "1.2rem" }}>{objectCount}</span>
        </div>
        {loading && (
          <div
            className="text-center px-4 py-2 mt-2 rounded-lg"
            style={{
              background: "rgba(255, 193, 7, 0.1)",
              border: "2px solid #ffb300",
              color: "#ffca28",
              fontWeight: "bold",
              fontSize: "1.1rem",
            }}
          >
            Loading...
          </div>
        )}
      </div>
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
                title={file.name} // Show full name on hover
              >
                {file.name}
              </span>

              {/* File Size Column */}
              <span className="w-1/5 text-center">{file.size} MB</span>

              {/* Download Button Column */}
              <button
                onClick={() => handleDownload(file.name)}
                className="w-1/3 py-1 px-3 bg-blue-700 hover:bg-blue-800 text-white rounded"
              >
                Download
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
