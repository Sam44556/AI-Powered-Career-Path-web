"use client";

import { useSession } from "next-auth/react";
import axios from "axios";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Loader2, FileDown, AlertTriangle } from "lucide-react";

export default function ResumePage() {
  const { data: session } = useSession();
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    if (session?.user?.id) {
      axios
        .get(`/api/resume?userId=${session.user.id}`)
        .then((res) => setStatus(res.data.status || "ready"))
        .catch((err) => {
          console.error("Failed to fetch resume status:", err);
          setStatus("error");
        });
    } else if (session === null) {
      // If session is loaded and there's no user
      setStatus("error");
    }
  }, [session]);

  const renderContent = () => {
    switch (status) {
      case "loading":
        return (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
            <p className="text-gray-600 text-lg font-medium">
              Checking your profile status...
            </p>
          </div>
        );
      case "error":
        return (
          <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-lg p-8 text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-red-700 mb-3">
              Something Went Wrong
            </h2>
            <p className="text-gray-600">
              We couldn’t fetch your profile details. Please try again later.
            </p>
          </div>
        );
      case "incomplete":
        return (
          <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-lg p-8 text-center">
            <h2 className="text-2xl font-bold text-blue-800 mb-3">
              Complete Your Profile to Generate a Resume
            </h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Your profile is missing key information like education, experience, or skills needed to create a professional resume.
            </p>
            <Link
              href="/info"
              className="inline-block px-8 py-3 bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-xl shadow-lg transition duration-300 transform hover:scale-105"
            >
              Go to Profile
            </Link>
          </div>
        );
      default:
        return (
          <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-lg p-8 text-center">
            <FileDown className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-green-800 mb-3">
              Your Resume is Ready!
            </h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Your profile is complete. Download your AI-generated, professional resume now.
            </p>
            <a
              href={`/api/resume?userId=${session?.user?.id}`}
              className="inline-block px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl shadow-lg transition duration-300 transform hover:scale-105"
            >
              Download Resume (PDF)
            </a>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-extrabold text-blue-700">
            Your Professional Resume
          </h1>
          <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Create and download a professional, standout resume from your profile data to impress employers.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          {renderContent()}
        </motion.div>
      </div>
    </div>
  );
}
