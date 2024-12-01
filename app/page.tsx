"use client";

import FeatureMain from "@/components/main/feature";
import { sampleFunction } from "@/serverFunctions/account/account";

function HomePage() {
  return (
    <div>
      <div className="text-center my-5">
        <h1 className="text-4xl lg:text-6xl md:text-5xl sm:text-4xl text-navbar">
          bedrock-project
        </h1>
      </div>
      <button onClick={sampleFunction}>TEST</button>
    </div>
  );
}

export default HomePage;
