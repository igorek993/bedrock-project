"use client";

import Link from "next/link";

function HomePage() {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Hero Section */}
      <header className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-20">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold">FileNova</h1>
          <p className="mt-4 text-xl md:text-2xl">
            Next-Generation File Management: Upload, Chat, Explore.
          </p>
          <div className="mt-8">
            <Link href="/file-management">
              <button className="bg-white text-blue-600 font-semibold px-6 py-3 rounded-md shadow-lg hover:bg-gray-200">
                Get Started
              </button>
            </Link>
            <Link href="/about-us">
              <button className="ml-4 bg-blue-700 text-white font-semibold px-6 py-3 rounded-md shadow-lg hover:bg-blue-800">
                Learn More
              </button>
            </Link>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">
            Why Choose FileNova?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-lg text-center">
              <h3 className="text-xl font-semibold mb-4">Effortless Uploads</h3>
              <p className="text-gray-700">
                Seamlessly upload your files with our intuitive drag-and-drop
                interface.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-lg text-center">
              <h3 className="text-xl font-semibold mb-4">Chat with Files</h3>
              <p className="text-gray-700">
                Interact with your data like never before using our chat-powered
                insights.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-lg text-center">
              <h3 className="text-xl font-semibold mb-4">Secure Storage</h3>
              <p className="text-gray-700">
                Your files are safe with end-to-end encryption and robust
                cloud-based architecture.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-blue-600 text-white py-20">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">
            Start Interacting With Your Files Today!
          </h2>
          <p className="text-lg mb-8">
            Experience the future of file interaction with FileNova.
          </p>
          <Link href="/sign-up">
            <button className="bg-white text-blue-600 font-semibold px-6 py-3 rounded-md shadow-lg hover:bg-gray-200">
              Sign Up Now
            </button>
          </Link>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
