"use client";

import { UploadForm } from "@/components/account/UploadForm";
import { useAuth, useUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";

function Account() {
  const { isLoaded, userId, sessionId, getToken } = useAuth();

  if (!userId) {
    redirect("/sign-in");
  }

  return <UploadForm />;
}

export default Account;
