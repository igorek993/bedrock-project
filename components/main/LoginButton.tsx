"use client";
import { useSession, signIn, signOut } from "next-auth/react";

export default function Component() {
  const { data: session } = useSession();
  if (session && session.user) {
    return (
      <>
        Signed in as {session.user.email} <br />
        <button onClick={() => signOut()}>Sign out</button>
      </>
    );
  }
  return (
    <button
      className="hover:bg-featureMain bg-navbarButton text-black font-bold py-2 px-8 border border-blue-700 rounded w-40"
      onClick={() => signIn("cognito")}
    >
      Войти
    </button>
  );
}
