"use client";

const Feature = ({ text }: { text: string }) => {
  return (
    <div className="flex items-center p-3 justify-center text-center w-full sm:w-4/5 md:w-2/5 m-1 sm:m-6 bg-featureMain rounded-lg min-h-20">
      {text}
    </div>
  );
};

export default Feature;
