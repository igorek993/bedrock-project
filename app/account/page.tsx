"use client";

import LoginButton from "@/components/main/LoginButton";
import { UploadForm } from "@/components/account/UploadForm";
import { ChatWindow } from "@/components/account/ChatWindow";
import { useAuth } from "@clerk/nextjs";

async function Account() {
  const { isLoaded, userId, sessionId, getToken } = useAuth();

  return (
    <div className="flex flex-col items-center justify-center text-center">
      {userId && (
        <>
          <h1 className="mb-10 text-xl font-bold">
            Добро пожаловать в ваш личный кабинет, {userId}!
          </h1>
          <div className="flex flex-row justify-between w-full max-w-6xl">
            {/* ChatWindow on the left */}
            <div className="w-1/2 pr-4">
              <ChatWindow />
            </div>

            {/* UploadForm on the right */}
            <div className="w-1/2 pl-10">
              <UploadForm />
            </div>
          </div>
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
