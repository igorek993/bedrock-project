import { getPresignedUrl } from "@/serverFunctions/account/account";

export function UploadForm() {
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
  }

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
    </div>
  );
}
