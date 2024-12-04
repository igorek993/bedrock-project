"use client";

import { UserProfile } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import React from "react";
import { useAuth, useUser } from "@clerk/nextjs";

const Profile = () => {
  const { userId } = useAuth();
  const { user } = useUser();

  if (!userId) {
    redirect("/");
  }

  return (
    <div className="flex flex-col items-center justify-center mt-8">
      <h1 className="text-2xl">{user?.username}</h1>
      <UserProfile />
    </div>
  );
};

export default Profile;
