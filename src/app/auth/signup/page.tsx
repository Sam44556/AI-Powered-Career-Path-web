"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function SignUpPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    if (name === "password") {
      setPasswordErrors(validatePassword(value));
    }
  };

  const validatePassword = (password: string) => {
    const errors: string[] = [];
    if (password.length < 4) errors.push("At least 4 characters");
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Password validation
    const errors = validatePassword(form.password);
    if (errors.length > 0) {
      alert("Please fix password requirements: " + errors.join(", "));
      return;
    }

    if (form.password !== form.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          name: form.name,
          password: form.password,
        }),
      });

      const data = await res.json();
      alert(data.message);
      if (res.ok) router.push("/home");
    } catch (error) {
      console.error(error);
      alert("Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    await signIn("google", { callbackUrl: "/home" });
  };
  return (
    <div className="flex items-center justify-center min-h-screen bg-blue-50">
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-center text-blue-700 mb-6">
          Create Account
        </h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            value={form.name}
            placeholder="Full Name"
            className="w-full text-gray-800 p-3 border rounded-lg"
            onChange={handleChange}
            required
          />
          <input
            type="email"
            name="email"
            value={form.email}
            placeholder="Email"
            className="w-full text-gray-800 p-3 border rounded-lg"
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            value={form.password}
            placeholder="Password"
            className="w-full text-gray-800 p-3 border rounded-lg"
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="confirmPassword"
            value={form.confirmPassword}
            placeholder="Confirm Password"
            className="w-full text-gray-800 p-3 border rounded-lg"
            onChange={handleChange}
            required
          />
          <button
            type="submit"
            disabled={isLoading}
            className="w-full p-3 bg-blue-700 text-white rounded-lg hover:bg-blue-800 disabled:opacity-50"
          >
            {isLoading ? "Signing Up..." : "Sign Up"}
          </button>
        </form>
           <div className="mt-6">
          <button
            onClick={handleGoogleLogin}
            className="w-full bg-white text-gray-700 border border-gray-300 py-3 rounded-lg shadow hover:bg-gray-100 transition"
          >
            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              alt="Google"
              className="inline w-5 h-5 mr-2"
            />
            Continue with Google
          </button>
        </div>
        <p className="text-sm text-center text-gray-600 mt-4">
          Already have an account?{" "}
          <a href="/auth/login" className="text-blue-700 font-semibold">
            Login
          </a>
        </p>
      </div>
    </div>
  );
}
