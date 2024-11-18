import { getNumberOfFiles, syncFiles } from "@/serverFunctions/account/account";
import { useState, useEffect } from "react";

export function SyncStatusIndicator() {
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

  useEffect(() => {
    fetchFileCount(); // Trigger the function when the component renders
  }, []); // Empty dependency array ensures this runs only once after initial render

  return (
    <div className="flex">
      <div>{`Current files count ${objectCount}`}</div>
      {!filesSynced && !loading && (
        <button onClick={localSyncFiles}>Sync Files</button>
      )}
      {filesSynced && <div>Files are in sync</div>}
      {loading && <div>Loading...</div>}
    </div>
  );
}
