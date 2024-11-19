import {
  getPresignedUrl,
  getNumberOfFiles,
  syncFiles,
} from "@/serverFunctions/account/account";
import { useState, useEffect } from "react";

export function UploadForm() {
  const [objectCount, setObjectCount] = useState();
  const [filesSynced, setfilesSynced] = useState(false);
  const [loading, setLoading] = useState(false);

  async function fetchFileCount() {
    const response = await getNumberOfFiles();
    if (response.status === "success") {
      setObjectCount(response.fileCount);
    } else {
      setObjectCount("Error");
    }
  }

  async function localSyncFiles() {
    setLoading(true);
    const response = await syncFiles();
    if (response.status === "success") {
      setfilesSynced(true);
      setLoading(false);
    } else {
      setfilesSynced(false);
      setLoading(false);
    }
  }

  async function uploadFiles(formData) {
    if (!formData.getAll("files")[0].name) return;
    const files = formData.getAll("files");
    for (const file of files) {
      const presignedUrl = await getPresignedUrl(file);
      const fileUpload = await fetch(presignedUrl.url!, {
        method: "PUT",
        body: file,
      });

      console.log(fileUpload);
    }
    fetchFileCount();
  }

  useEffect(() => {
    fetchFileCount(); // Trigger the function when the component renders
  }, []); // Empty dependency array ensures this runs only once after initial render

  return (
    <div
      className="max-w-lg mx-auto mt-10 p-6 rounded-lg shadow"
      style={{
        background: "linear-gradient(145deg, #000000, #003366)",
        border: "2px solid #64b5f6",
        color: "white",
        boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.5)",
      }}
    >
      <form
        action={uploadFiles}
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
        <input
          type="file"
          id="files"
          name="files"
          accept="*"
          multiple
          className="block w-full text-sm text-gray-900 rounded-lg cursor-pointer focus:outline-none"
          style={{
            background: "#2a2a2a",
            border: "2px solid #1976d2",
            color: "#ffffff",
            padding: "10px 12px",
          }}
        />
        <button
          type="submit"
          className="py-2 px-4 font-bold rounded-lg"
          style={{
            backgroundColor: "#0d47a1",
            color: "#ffffff",
            transition: "all 0.2s ease-in-out",
            boxShadow: "0px 2px 12px rgba(0, 0, 0, 0.2)",
          }}
          onMouseOver={(e) =>
            (e.currentTarget.style.backgroundColor = "#1565c0")
          }
          onMouseOut={(e) =>
            (e.currentTarget.style.backgroundColor = "#0d47a1")
          }
        >
          Upload
        </button>
      </form>
      <div className="flex flex-col space-y-2 mt-4 items-center">
        <div
          className="text-center px-4 py-2 rounded-lg"
          style={{
            background: "rgba(255, 255, 255, 0.1)", // Subtle transparent background
            border: "2px solid #42a5f5", // Light blue border
            color: "#64b5f6", // Highlighted text color
            fontWeight: "bold",
            fontSize: "1.1rem",
          }}
        >
          Current files count:{" "}
          <span style={{ fontSize: "1.2rem" }}>{objectCount}</span>
        </div>
        {filesSynced && (
          <div
            className="text-center px-4 py-2 mt-2 rounded-lg"
            style={{
              background: "rgba(0, 200, 83, 0.1)", // Subtle green background
              border: "2px solid #66bb6a", // Light green border
              color: "#81c784", // Green text color
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
            className="py-2 px-4 font-bold rounded-lg"
            style={{
              backgroundColor: "#0d47a1",
              color: "#ffffff",
              transition: "all 0.2s ease-in-out",
              boxShadow: "0px 2px 12px rgba(0, 0, 0, 0.2)",
            }}
            onMouseOver={(e) =>
              (e.currentTarget.style.backgroundColor = "#1565c0")
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.backgroundColor = "#0d47a1")
            }
          >
            Sync Files
          </button>
        )}
        {loading && (
          <div
            className="text-center px-4 py-2 mt-2 rounded-lg"
            style={{
              background: "rgba(255, 193, 7, 0.1)", // Subtle yellow background
              border: "2px solid #ffb300", // Light yellow border
              color: "#ffca28", // Yellow text color
              fontWeight: "bold",
              fontSize: "1.1rem",
            }}
          >
            Loading...
          </div>
        )}
      </div>
    </div>
  );
}
