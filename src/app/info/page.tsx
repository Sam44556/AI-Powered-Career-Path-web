"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

// ... (interfaces remain the same)

interface CareerPath {
  title: string;
  summary: string;
}

interface Skill {
  name: string;
  level: string;
}

interface Resume {
  summary: string;
  education: string;
  experience: string;
  skills: Skill[];
}

export default function ProfileForm() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const userId = session?.user?.id;

  const [interests, setInterests] = useState<string[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [careerPaths, setCareerPaths] = useState<CareerPath[]>([]);
  const [resume, setResume] = useState<Resume>({ summary: "", education: "", experience: "", skills: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  useEffect(() => {
    async function fetchProfile() {
      if (!userId) return;
      try {
        const res = await axios.get(`/api/profile?userId=${userId}`);
        const user = res.data;
        setInterests(user.interests || []);
        setSkills(user.skills || []);
        setCareerPaths(user.careerPaths || []);
        setResume(user.resume || { summary: "", education: "", experience: "", skills: [] });
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      }
    }
    if (userId) {
      fetchProfile();
    }
  }, [userId]);

  const handleSave = async () => {
    setLoading(true);
    try {
      await axios.post("/api/profile", { userId, interests, skills, careerPaths, resume });
      alert("Profile saved successfully!");
    } catch (error) {
      console.error("Failed to save profile:", error);
      alert("Failed to save profile. Please try again.");
    }
    setLoading(false);
    router.push('/home');
  };

  const formSectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl sm:text-5xl font-extrabold text-blue-700">Your Professional Profile</h1>
          <p className="mt-3 text-lg text-gray-600">Keep your information up-to-date to get the best career recommendations.</p>
        </motion.div>

        <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-lg p-8 space-y-8">
          {/* Interests */}
          <motion.div variants={formSectionVariants} initial="hidden" animate="visible">
            <label className="text-xl font-semibold text-gray-800 mb-3 block">Your Interests</label>
            <input
              type="text"
              value={interests.join(", ")}
              onChange={(e) => setInterests(e.target.value.split(",").map(i => i.trim()))}
              placeholder="e.g., Artificial Intelligence, Web Development"
              className="w-full bg-white/80 border-2 border-blue-100 text-gray-800 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-300"
            />
          </motion.div>

          {/* Skills */}
          <motion.div variants={formSectionVariants} initial="hidden" animate="visible" transition={{ delay: 0.1 }}>
            <label className="text-xl font-semibold text-gray-800 mb-3 block">Skills</label>
            <div className="space-y-3">
              {skills.map((skill, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <input
                    type="text"
                    value={skill.name}
                    onChange={(e) => {
                      const newSkills = [...skills];
                      newSkills[idx].name = e.target.value;
                      setSkills(newSkills);
                    }}
                    placeholder="Skill Name"
                    className="flex-1 bg-white/80 border-2 border-blue-100 text-gray-800 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-300"
                  />
                  <select
                    value={skill.level}
                    onChange={(e) => {
                      const newSkills = [...skills];
                      newSkills[idx].level = e.target.value;
                      setSkills(newSkills);
                    }}
                    className="bg-white/80 border-2 border-blue-100 text-gray-800 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-300"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              ))}
            </div>
            <button
              onClick={() => setSkills([...skills, { name: "", level: "beginner" }])}
              className="mt-4 px-5 py-2 bg-blue-100 text-blue-700 font-semibold rounded-lg hover:bg-blue-200 transition duration-300"
            >
              + Add Skill
            </button>
          </motion.div>

          {/* Career Paths */}
          <motion.div variants={formSectionVariants} initial="hidden" animate="visible" transition={{ delay: 0.2 }}>
             <label className="text-xl font-semibold text-gray-800 mb-3 block">Preferred Career Paths</label>
             <div className="space-y-4">
                {careerPaths.map((c, idx) => (
                  <div key={idx} className="bg-blue-50/50 p-4 rounded-lg">
                    <input
                      type="text"
                      placeholder="Career Title, e.g., Full Stack Developer"
                      value={c.title}
                      onChange={(e) => {
                        const newPaths = [...careerPaths];
                        newPaths[idx].title = e.target.value;
                        setCareerPaths(newPaths);
                      }}
                      className="w-full bg-white/80 border-2 border-blue-100 text-gray-800 p-3 rounded-xl mb-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-300"
                    />
                    <textarea
                      placeholder="Brief summary of why you're interested in this path."
                      value={c.summary}
                      onChange={(e) => {
                        const newPaths = [...careerPaths];
                        newPaths[idx].summary = e.target.value;
                        setCareerPaths(newPaths);
                      }}
                      className="w-full bg-white/80 border-2 border-blue-100 text-gray-800 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-300"
                      rows={3}
                    />
                  </div>
                ))}
             </div>
            <button
              onClick={() => setCareerPaths([...careerPaths, { title: "", summary: "" }])}
              className="mt-4 px-5 py-2 bg-blue-100 text-blue-700 font-semibold rounded-lg hover:bg-blue-200 transition duration-300"
            >
              + Add Career Path
            </button>
          </motion.div>

          {/* Resume */}
          <motion.div variants={formSectionVariants} initial="hidden" animate="visible" transition={{ delay: 0.3 }}>
            <label className="text-xl font-semibold text-gray-800 mb-3 block">Resume Details</label>
            <div className="space-y-3">
              <textarea
                placeholder="Professional Summary"
                value={resume.summary}
                onChange={(e) => setResume({ ...resume, summary: e.target.value })}
                className="w-full text-gray-800 bg-white/80 border-2 border-blue-100 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-300"
                rows={4}
              />
              <input
                type="text"
                placeholder="Education, e.g., B.S. in Computer Science"
                value={resume.education}
                onChange={(e) => setResume({ ...resume, education: e.target.value })}
                className="w-full text-gray-800 bg-white/80 border-2 border-blue-100 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-300"
              />
              <input
                type="text"
                placeholder="Recent Experience, e.g., Software Engineer at Tech Corp"
                value={resume.experience}
                onChange={(e) => setResume({ ...resume, experience: e.target.value })}
                className="w-full text-gray-800 bg-white/80 border-2 border-blue-100 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-300"
              />
            </div>
          </motion.div>

          <motion.div className="text-center pt-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
            <button
              onClick={handleSave}
              disabled={loading || !userId}
              className="px-10 py-4 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl shadow-lg transition duration-300 transform hover:scale-105 disabled:bg-gray-400 disabled:scale-100"
            >
              {loading ? "Saving..." : "Save Profile"}
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
