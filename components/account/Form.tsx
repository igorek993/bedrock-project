import { getPresignedUrl } from "@/serverFunctions/account/account";

const initialState = { status: "", message: "" };

export function UploadForm() {
  async function uploadFiles(files) {
    const presignedUrl = await getPresignedUrl(files);
    console.log(presignedUrl.url);
    console.log(files.get("file"));

    const fileUpload = await fetch(presignedUrl.url, {
      method: "PUT",
      body: files.get("file"),
    });

    console.log(fileUpload);
  }
  return (
    <div className="form-wrapper">
      <form action={uploadFiles}>
        <input type="file" id="files" name="files" accept="*" multiple />
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          upload
        </button>
      </form>
    </div>
  );
}
