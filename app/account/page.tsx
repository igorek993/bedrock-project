"use client";
import LoginButton from "@/components/main/LoginButton";
import { useSession } from "next-auth/react";

function Account() {
  const { data: session, status } = useSession();

  return (
    <div className="flex flex-col items-center justify-center text-center">
      {session && session.user && (
        <>
          <h1 className="mb-10">
            Добро пожаловать в ваш личный кабинет, {session.user.name}!
          </h1>
          <label
            htmlFor="multiple_files"
            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
          >
            Upload multiple files
          </label>
          <input
            id="multiple_files"
            type="file"
            multiple
            className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
          />
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
