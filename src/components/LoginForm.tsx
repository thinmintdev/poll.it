import React, { useState, ChangeEvent, FormEvent } from "react";
import { supabase } from "../utils/supabaseClient";
import { useRouter } from "next/router";

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message || "Login failed. Please try again.");
      setLoading(false);
      return;
    }
    router.push("/");
  };

  return (
    <form
      className="max-w-md mx-auto mt-10 bg-card dark:bg-poll-darker shadow-lg rounded-lg p-8 flex flex-col gap-6 border border-border"
      onSubmit={handleSubmit}
      aria-label="Login form"
    >
      <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>
      <div>
        <label htmlFor="login-email" className="block text-lg font-semibold mb-2">
          Email
        </label>
        <input
          id="login-email"
          name="email"
          type="email"
          className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter your email"
          value={email}
          onChange={handleEmailChange}
          required
          aria-required="true"
          aria-label="Email address"
          tabIndex={0}
          autoComplete="email"
        />
      </div>
      <div>
        <label htmlFor="login-password" className="block text-lg font-semibold mb-2">
          Password
        </label>
        <input
          id="login-password"
          name="password"
          type="password"
          className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter your password"
          value={password}
          onChange={handlePasswordChange}
          required
          aria-required="true"
          aria-label="Password"
          tabIndex={0}
          autoComplete="current-password"
        />
      </div>
      {error && (
        <div className="text-red-600 text-sm" role="alert">{error}</div>
      )}
      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-3 rounded-md font-semibold text-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-60 disabled:cursor-not-allowed"
        aria-label="Login"
        tabIndex={0}
        disabled={loading}
      >
        {loading ? "Logging in..." : "Login"}
      </button>
    </form>
  );
};

export default LoginForm;