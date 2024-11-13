import { useActionState } from "react";
import { uploadFile } from "@/serverFunctions/account/account";
import { SubmitButton } from "./SubmitButton";

const initialState = { status: "", message: "" };

export function UploadForm() {
  const [state, formAction] = useActionState(uploadFile, initialState);

  return (
    <div className="form-wrapper">
      <form action={formAction}>
        <input type="file" id="file" name="file" accept="*" multiple />
        <SubmitButton />
      </form>
      {state?.status && <div className="bg-orange-300">{state?.message}</div>}
    </div>
  );
}
