"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function Page() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-blue-100 text-gray-800">
      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-5xl sm:text-6xl font-extrabold text-blue-700"
        >
          Unlock Your Career Potential
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="mt-4 text-lg sm:text-xl text-gray-600 max-w-2xl"
        >
          Discover tailored career paths, improve your skills, and connect with
          opportunities designed just for you.
        </motion.p>

        <div className="mt-8 flex gap-4 flex-wrap justify-center">
          <Link
            href="/info"
            className="px-8 py-3 bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-xl shadow-lg transition duration-300 transform hover:scale-105"
          >
            profile
          </Link>
         
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-6 bg-white/70 backdrop-blur-md">
        <div className="max-w-6xl mx-auto grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { title: "Jobs & Internships", desc: "Find curated job and internship opportunities matching your skills.", href: "/jobs" },
            { title: "Skills Analysis & Future Skill Suggestion", desc: "Learn and grow with personalized skill tracks and receive personalized recommendations for new skills to learn", href: "/skills" },
            { title: "Resources", desc: "Access guides, articles, and expert tips.", href: "/resources" },
            { title: "Resume",desc:"Create a professional, standout resume from scratch with our guided builder to impress employers.",href:"/resume" },
         
         ].map((f, i) => (
            <Link href={f.href} key={i}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.2 }}
                className="p-6 rounded-2xl bg-gradient-to-br from-white to-blue-50 shadow-lg hover:shadow-2xl transition duration-300 h-full cursor-pointer"
              >
                <h3 className="text-2xl font-semibold mb-2 text-blue-700">{f.title}</h3>
                <p className="text-gray-600">{f.desc}</p>
              </motion.div>
            </Link>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-6 text-center bg-gradient-to-br from-blue-50 to-white">
        <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-8">
          {[
            { num: "10k+", label: "Users" },
            { num: "500+", label: "Jobs" },
            { num: "200+", label: "Resources" },
            { num: "50+", label: "Career Paths" },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.2 }}
            >
              <p className="text-3xl font-bold text-blue-700">{stat.num}</p>
              <p className="text-gray-600">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

    
    </div>
  );
}
