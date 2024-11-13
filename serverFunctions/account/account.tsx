"use server";

export async function uploadFile(prevState, formData) {
  try {
    console.log(formData);
    return { status: "success", message: "File has been uploaded" };
  } catch (error) {
    return { status: "error", message: "Error" };
  }
}
