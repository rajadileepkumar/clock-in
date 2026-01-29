"use client";

import { useState } from "react";
import { useDispatch } from "react-redux";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { setUser } from "../store/slices/authSlice";


export default function LoginPage() {
  const dispatch = useDispatch();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // handle login logic here
    console.log("Username:", username);
    console.log("Password:", bcrypt.hashSync(password, 10));
    
    if (!username || !password) {
      setError("Username and password are required");
      return;
    }
    setError(null);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: {  "Content-Type": "application/json" },
      body: JSON.stringify({ email: username, password: bcrypt.hashSync(password, 10) }),
    });
    const data = await res.json();
    console.log("Login response data:", data);
    if (!res.ok) {
      setError(data.message || "Login failed");
      return;
    }
    dispatch(
      setUser(data)
    );
    redirect("/dashboard");
  };

  const isDisabled = !username || !password;

  return (
    <div className="min-h-screen w-full bg-slate-100 flex items-center justify-center overflow-hidden">
      <div className="w-full max-w-5xl h-[520px] bg-white rounded-2xl shadow-xl flex overflow-hidden">
        {/* LEFT PANEL */}
        <div className="hidden md:flex w-1/2 bg-blue-500 items-center justify-center relative">
          <div className="text-white text-center px-10">
            <h2 className="text-3xl font-semibold mb-4">Hello!</h2>
            <p className="text-blue-100">
              Welcome back. Please login to your account.
            </p>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="w-full md:w-1/2 flex items-center justify-center px-10">
          <div className="w-full max-w-sm">
            <h1 className="text-2xl font-semibold text-slate-800 text-center">
              Sign In
            </h1>

            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm text-slate-600 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-600 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full px-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              <button
                type="submit"
                disabled={isDisabled}
                className={`w-full py-2 rounded-md font-medium transition
                                ${
                                  isDisabled
                                    ? "bg-blue-300 cursor-not-allowed"
                                    : "bg-blue-500 hover:bg-blue-600 text-white cursor-pointer"
                                }`}
              >
                Login
              </button>

              {error && (
                <p className="text-sm text-red-500 text-center">{error}</p>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
