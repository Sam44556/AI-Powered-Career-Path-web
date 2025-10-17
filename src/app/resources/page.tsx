"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import Link from "next/link";
export default function ResourcesPage() {
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const res = await fetch("/api/resources");
        const data = await res.json();

        if (data.message === "no_user_data") {
          setMessage("No user data found. Please complete your profile first.");
        } else {
          setResources(data.resources || []);
        }
      } catch {
        setMessage("Failed to load resources.");
      } finally {
        setLoading(false);
      }
    };

    fetchResources();
  }, []);

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "video":
        return "bg-red-100 text-red-700";
      case "article":
        return "bg-green-100 text-green-700";
      case "website":
        return "bg-cyan-100 text-cyan-700";
      case "course":
        return "bg-purple-100 text-purple-700";
      default:
        return "bg-blue-100 text-blue-700";
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-blue-100 text-gray-800">
      {/* Header */}
      <section className="text-center py-16 px-6">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-5xl sm:text-6xl font-extrabold text-blue-700"
        >
          Your Personalized Learning Resources
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="mt-4 text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto"
        >
          Explore curated learning materials — videos, articles, and courses tailored to your growth.
        </motion.p>
      </section>

      {/* Resource List */}
      <section className="pb-20 px-6">
        {loading ? (
          <p className="text-center text-gray-500">Finding the best resources for you...</p>
        ) : message ? (
          <div className="flex flex-col items-center justify-center text-center py-20">
            <h2 className="text-2xl font-bold text-blue-800 mb-3">
              Complete Your Profile to Get Job Recommendations
            </h2>
            <p className="text-gray-600 mb-6 max-w-md">
              We need more details about your skills and career interests to
              match the best opportunities for you.
            </p>
            <Link href="/info">
              <span className="px-8 py-3 bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-xl shadow-lg transition duration-300 transform hover:scale-105 cursor-pointer">
                Go to Profile
              </span>
            </Link>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {resources.map((res, index) => (
              <motion.div
                key={index}
                className="p-6 rounded-2xl bg-gradient-to-br from-white to-blue-50 shadow-lg hover:shadow-2xl transition duration-300 border border-blue-100 relative overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                {/* Type Label */}
                <span
                  className={`absolute top-4 right-4 text-xs font-semibold px-3 py-1 rounded-full ${getTypeColor(
                    res.type
                  )}`}
                >
                  {res.type}
                </span>

                <h3 className="text-xl font-bold text-blue-700 mb-2">{res.title}</h3>
                <p className="text-gray-600 text-sm line-clamp-3 mb-4">{res.description}</p>

                <a
                  href={res.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-800 transition"
                >
                  Visit Resource
                  <ExternalLink size={16} />
                </a>
              </motion.div>
            ))}
          </div>
        )}
      </section>

    
    </div>
  );
}
