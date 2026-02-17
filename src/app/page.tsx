import { getServerSession } from "next-auth";
import { authOptions } from "@/app/utils/authOptions";
import { redirect } from "next/navigation";
export default async function HomePage() {
    const session = await getServerSession(authOptions);
  
    if (session) {
      // Logged-in users should never see /, redirect them to /home
      redirect("/home");
    }
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      {/* Navbar */}
      {/* Hero Section */}
      <main className="flex flex-col items-center justify-center flex-1 text-center px-6">
        <h2 className="text-4xl md:text-5xl font-extrabold text-gray-800 mb-6">
          Discover Your <span className="text-blue-700">AI-Powered Career Path</span>
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mb-8">
          Get personalized job opportunities, skill growth insights, learning resources,
          and AI-generated resume support. Let AI guide your career journey.
        </p>
        <a href="/auth/signup" className="px-6 py-3 bg-blue-700 text-white rounded-xl shadow-lg hover:bg-blue-800">
          Get Started
        </a>
      </main>
    </div>
  )
}
