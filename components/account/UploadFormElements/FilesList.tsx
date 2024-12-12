interface FilesListProps {
  fileList: {
    name: string;
    size: number;
    isProcessing: boolean;
  }[];
  failedToSyncFiles: string[];
  handleDownload: (fileName: string) => void;
  handleDelete: (fileName: string) => void;
}

const FilesList: React.FC<FilesListProps> = ({
  fileList,
  failedToSyncFiles,
  handleDownload,
  handleDelete,
}) => {
  return (
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
            <span className="w-2/5 truncate" title={file.name}>
              {file.name}
            </span>

            {/* File Size Column */}
            <span className="w-1/5 text-center">{file.size} MB</span>

            {/* Action Buttons Column */}
            <div className="w-1/3 flex justify-end items-center gap-2">
              {failedToSyncFiles.includes(file.name) && (
                <div className="relative group">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-yellow-500"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    // @ts-ignore
                    title="Failed to sync"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-9-3a1 1 0 012 0v4a1 1 0 01-2 0V7zm1 8a1 1 0 100-2 1 1 0 000 2z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div className="absolute min-w-max bottom-full mb-2 left-1/2 transform -translate-x-1/2 px-4 py-2 bg-gray-800 text-whiterounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    No text content
                    <br /> was found in the file.
                  </div>
                </div>
              )}
              <button
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
              <button
                onClick={() => handleDelete(file.name)}
                disabled={file.isProcessing}
                className={`flex items-center justify-center py-1 px-3 rounded ${
                  file.isProcessing
                    ? "bg-red-400 cursor-not-allowed"
                    : "bg-red-600 hover:bg-red-700"
                } text-white`}
                title="Delete"
              >
                {file.isProcessing ? (
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
  );
};

export default FilesList;
