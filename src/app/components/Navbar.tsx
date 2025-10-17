"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
export default function Navbar() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return null; // Or a loading spinner
  }

  return (
    <nav className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 ">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-6">
          <Link href="/" className="text-2xl font-bold text-blue-700">CareerAI</Link>
          
        </div>
        <div>
          {session ? (
            <div className="flex items-center space-x-4">
              <Link href="/home" className="text-gray-700 hover:text-blue-700 transition text-bold">
            Home
          </Link>
              <p className="text-gray-800">Welcome, {session.user?.name || 'User'}</p>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="bg-transparent hover:bg-red-100 text-red-600 font-semibold py-2 px-4 rounded-lg border border-red-200 transition duration-300"
              >
                Logout
              </button>
            </div>
          ) : (
             <div className="space-x-4">
          <a href="/auth/login" className="px-4 py-2 text-blue-700 font-semibold">Login</a>
          <a href="/auth/signup" className="px-4 py-2 bg-blue-700 text-white rounded-lg shadow hover:bg-blue-800">Sign Up</a>
        </div>
          )}
        </div>
      </div>
    </nav>
  );
}
