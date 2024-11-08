"use client";

function Spinner() {
  return (
    <div className="flex justify-center items-center mt-10">
      <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}

function loading() {
  return <Spinner />;
}
export default loading;
