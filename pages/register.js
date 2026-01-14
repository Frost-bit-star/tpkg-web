// pages/register.js
import React from "react";

export default function Register() {
  const handleGitHub = () => {
    window.location.href = "/api/auth/github";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-md w-96 text-center">
        <h1 className="text-2xl font-bold mb-6">Register</h1>
        <p className="mb-6 text-gray-600">Register using your GitHub account.</p>
        <button
          onClick={handleGitHub}
          className="flex items-center justify-center gap-2 w-full bg-black text-white py-2 px-4 rounded hover:bg-gray-800"
        >
          Register with GitHub
        </button>
      </div>
    </div>
  );
}
