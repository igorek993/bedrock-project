import { getPresignedUrl } from "@/serverFunctions/account/account";

const initialState = { status: "", message: "" };

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
