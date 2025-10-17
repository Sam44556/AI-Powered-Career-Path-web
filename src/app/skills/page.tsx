"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import Link from "next/link";
import { Loader2, Star, TrendingUp, BookOpen } from "lucide-react";

interface SkillAnalysis {
  skill_name: string;
  current_level: string;
  strengths: string[];
  improvements: string[];
  recommended_learning_paths: string[];
}

const COLORS = [
  "#2563EB",
  "#10B981",
  "#F59E0B",
  "#EC4899",
  "#8B5CF6",
  "#F43F5E",
];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 shadow-lg rounded-xl border border-gray-200">
        <p className="font-bold text-blue-600">{payload[0].name}</p>
        <p className="text-gray-700">{`Level: ${payload[0].value}%`}</p>
      </div>
    );
  }
  return null;
};

export default function SkillsPage() {
  const [data, setData] = useState<{
    summary: string;
    skills_analysis: SkillAnalysis[];
    suggested_next_skills: string[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSkill, setSelectedSkill] = useState<SkillAnalysis | null>(
    null
  );

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const res = await fetch("/api/skills");
        const json = await res.json();
        setData(json);
        if (json?.skills_analysis?.length > 0) {
          setSelectedSkill(json.skills_analysis[0]);
        }
      } catch (err) {
        console.error("Failed to fetch skills:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSkills();
  }, []);

  const defaultSummary =
    "Sami possesses a solid intermediate foundation in both frontend and backend web development, demonstrating a strong interest and potential to excel as a full-stack developer. Their current skills provide a good base for building complete web applications.";

  const levelToValue = (level: string) => {
    const map: Record<string, number> = {
      Beginner: 25,
      Intermediate: 50,
      Advanced: 75,
      Expert: 100,
    };
    return map[level] || 0;
  };

  const chartData =
    data?.skills_analysis?.map((s) => ({
      name: s.skill_name,
      value: levelToValue(s.current_level),
    })) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 text-gray-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Title Section - Always Visible */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <h1 className="text-5xl font-extrabold text-blue-700">
            Your Skill Growth Analysis
          </h1>
          <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            {data?.summary || defaultSummary}
          </p>
        </motion.div>

        {/* Loading Indicator or Main Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
            <p className="text-gray-600 text-lg font-medium">
              Fetching your personalized skill analysis...
            </p>
          </div>
        ) : !data || !data.skills_analysis ? (
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
          <>
            {/* Skill Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-white shadow-lg rounded-2xl p-6 border border-gray-100 mb-12"
            >
              <h2 className="text-xl font-semibold text-center mb-4 text-blue-700">
                Skill Proficiency Overview
              </h2>
              <div className="w-full h-[300px] sm:h-[400px]">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      outerRadius="80%"
                      fill="#8884d8"
                      dataKey="value"
                      label={(entry) => `${entry.name}`}
                    >
                      {chartData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Detailed Section */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="grid md:grid-cols-3 gap-8"
            >
              {/* Sidebar */}
              <div className="bg-white shadow-md rounded-2xl p-4 border border-gray-100">
                <h3 className="font-semibold text-lg mb-3 text-blue-700">
                  Your Skills
                </h3>
                <ul className="space-y-2">
                  {data.skills_analysis.map((skill) => (
                    <li key={skill.skill_name}>
                      <button
                        onClick={() => setSelectedSkill(skill)}
                        className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 ${
                          selectedSkill?.skill_name === skill.skill_name
                            ? "bg-blue-600 text-white shadow-lg"
                            : "hover:bg-blue-50 text-gray-700"
                        }`}
                      >
                        {skill.skill_name}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Skill Detail */}
              <div className="md:col-span-2">
                {selectedSkill && (
                  <motion.div
                    key={selectedSkill.skill_name}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    className="bg-white shadow-xl rounded-2xl p-8 border border-gray-100"
                  >
                    <h3 className="text-2xl font-bold text-blue-700 mb-2">
                      {selectedSkill.skill_name}
                    </h3>
                    <p className="text-gray-500 font-medium mb-4">
                      Current Level: {selectedSkill.current_level}
                    </p>

                    <div className="w-full bg-gray-200 rounded-full h-3 mb-6">
                      <div
                        className="bg-blue-600 h-3 rounded-full"
                        style={{
                          width: `${levelToValue(
                            selectedSkill.current_level
                          )}%`,
                        }}
                      ></div>
                    </div>

                    <TabbedAnalysis
                      strengths={selectedSkill.strengths}
                      improvements={selectedSkill.improvements}
                      learningPaths={selectedSkill.recommended_learning_paths}
                    />
                  </motion.div>
                )}
              </div>
            </motion.div>

            {/* Suggested Skills */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mt-12 text-center"
            >
              <h2 className="text-2xl font-semibold text-blue-700 mb-4">
                Suggested Next Skills to Learn
              </h2>
              <div className="flex flex-wrap justify-center gap-3">
                {data.suggested_next_skills.map((skill, i) => (
                  <motion.span
                    key={i}
                    whileHover={{ scale: 1.05 }}
                    className="px-4 py-2 bg-blue-100 text-blue-700 font-medium rounded-full shadow-sm"
                  >
                    {skill}
                  </motion.span>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}

function TabbedAnalysis({
  strengths,
  improvements,
  learningPaths,
}: {
  strengths: string[];
  improvements: string[];
  learningPaths: string[];
}) {
  const [activeTab, setActiveTab] = useState("strengths");
  const tabs = [
    { id: "strengths", label: "Strengths", icon: Star, data: strengths },
    {
      id: "improvements",
      label: "Improvements",
      icon: TrendingUp,
      data: improvements,
    },
    {
      id: "learningPaths",
      label: "Learning Paths",
      icon: BookOpen,
      data: learningPaths,
    },
  ];

  return (
    <div>
      <div className="border-b border-gray-200 mb-4">
        <nav className="flex space-x-6 justify-center" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`${
                activeTab === tab.id
                  ? "border-blue-600 text-blue-700"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              } py-2 px-3 border-b-2 font-medium flex items-center gap-2`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
      <div className="text-left">
        {tabs.map(
          (tab) =>
            activeTab === tab.id && (
              <ul
                key={tab.id}
                className="space-y-2 list-disc list-inside text-gray-700"
              >
                {tab.data.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            )
        )}
      </div>
    </div>
  );
}
