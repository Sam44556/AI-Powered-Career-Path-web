"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarDays, Loader2 } from "lucide-react";

// Job Card
function JobCard({ job }: { job: any }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div
      layout
      initial={{ borderRadius: 16 }}
      className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300"
    >
      <motion.div layout="position" className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-bold text-blue-800">{job.title}</h2>
          <p className="text-md text-gray-600 font-semibold">{job.company}</p>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors"
        >
          {isExpanded ? "Show Less" : "Show More"}
        </button>
      </motion.div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="pt-4">
              <p className="text-gray-700 mt-2">{job.description}</p>
              <div className="text-sm text-gray-800 mt-4">
                <strong className="font-semibold">Requirements:</strong>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  {job.requirements
                    .split(",")
                    .map((req: string, i: number) => (
                      <li key={i}>{req.trim()}</li>
                    ))}
                </ul>
              </div>
              <div className="flex justify-between items-center mt-5">
                <a
                  href={job.application_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-lg shadow-md transition duration-300 transform hover:scale-105"
                >
                  Apply Now
                </a>
                <div className="mb-4">
                  <span className="inline-flex items-center text-sm font-medium bg-purple-100 text-purple-700 px-3 py-1.5 rounded-full">
                    <CalendarDays className="w-4 h-4 mr-1.5" />
                    Deadline: {job.deadline || "N/A"}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function Page() {
  const { data: session } = useSession();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [insufficient, setInsufficient] = useState(false);

  useEffect(() => {
    async function fetchJobs() {
      if (!session?.user?.id) {
        setLoading(false);
        return;
      }
      try {
        const res = await axios.get("/api/jobs");
        if (res.data.message === "insufficient_profile") {
          setInsufficient(true);
        } else {
          setJobs(res.data.jobs || []);
        }
      } catch (error) {
        console.error("Failed to fetch jobs:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchJobs();
  }, [session]);

  const defaultSummary =
    "These AI-recommended jobs and internships are tailored to your skills, helping you find the best opportunities that match your growth and career path.";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header section — always visible */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <h1 className="text-5xl font-extrabold text-blue-700">
            AI-Recommended Jobs & Internships
          </h1>
          <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            {defaultSummary}
          </p>
        </motion.div>

        {/* Loading / Insufficient / Job list */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
            <p className="text-gray-600 text-lg font-medium">
              Finding personalized jobs for you...
            </p>
          </div>
        ) : insufficient ? (
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
          <div className="space-y-6">
            {jobs.length > 0 ? (
              jobs.map((job, index) => <JobCard key={index} job={job} />)
            ) : (
              <div className="text-center py-10 bg-white/50 rounded-xl shadow-md">
                <p className="text-gray-700 font-semibold">
                  No job recommendations found at the moment.
                </p>
                <p className="text-gray-500 mt-2">
                  Try updating your profile or check back later.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
