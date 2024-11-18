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
    <div className="max-w-lg mx-auto mt-10 p-6 bg-gray-50 border border-gray-300 rounded-lg shadow">
      <form action={uploadFiles} className="flex flex-col space-y-4">
        <label htmlFor="files" className="text-lg font-medium text-gray-700">
          Select Files to Upload
        </label>
        <input
          type="file"
          id="files"
          name="files"
          accept="*"
          multiple
          className="block w-full text-sm text-gray-900 bg-white border border-gray-300 rounded-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <button
          type="submit"
          className="py-2 px-4 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-400 focus:ring-offset-1"
        >
          Upload
        </button>
      </form>
      <div className="flex">
        <div>{`Current files count ${objectCount}`}</div>
        {!filesSynced && !loading && (
          <button onClick={localSyncFiles}>Sync Files</button>
        )}
        {filesSynced && <div>Files are in sync</div>}
        {loading && <div>Loading...</div>}
      </div>
    </div>
  );
}
