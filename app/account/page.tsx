"use client";
import LoginButton from "@/components/main/LoginButton";
import { useSession } from "next-auth/react";
import { UploadForm } from "@/components/account/Form";

function Account() {
  const { data: session, status } = useSession();

  return (
    <div className="flex flex-col items-center justify-center text-center">
      {session && session.user && (
        <>
          <h1 className="mb-10">
            Добро пожаловать в ваш личный кабинет, {session.user.name}!
          </h1>
          <UploadForm />
        </>
      )}
      {!status && (
        <div className="absolute top-[40vh] w-full flex justify-center">
          <LoginButton />
        </div>
      )}
    </div>
  );
}

export default Account;
