"use client";

import { useAuth } from "@clerk/nextjs";
import { useUser } from "@clerk/nextjs";

function AboutUs() {
  const { isLoaded, isSignedIn, user } = useUser();

  if (!isLoaded || !isSignedIn) {
    return null;
  }

  return (
    <div className="text-center mx-5">
      <h1>Мы работаем над этой страницей</h1>
      <div>{user.firstName}</div>
    </div>
  );
}

export default AboutUs;
