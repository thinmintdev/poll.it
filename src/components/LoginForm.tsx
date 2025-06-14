import React, { useState, ChangeEvent, FormEvent } from "react";
import { supabase } from "../utils/supabaseClient";
import { useRouter } from "next/router";

interface LoginFormProps {
  inDropdown?: boolean;
  onLoginSuccess?: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ inDropdown = false, onLoginSuccess }) => {
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
    
    if (onLoginSuccess) {
      onLoginSuccess();
    } else {
      router.push("/");
    }
  };

  const formClasses = inDropdown 
    ? "bg-transparent p-4 flex flex-col gap-4" 
    : "max-w-md mx-auto mt-10 bg-card dark:bg-poll-darker shadow-lg rounded-lg p-8 flex flex-col gap-6 border border-border";

  const inputClasses = "w-full px-4 rounded-md bg-[#1e2736] border border-[#2f3a4e] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#14b8a6]";
  
  const inputHeight = inDropdown ? "h-10" : "h-12";

  return (
    <form
      className={formClasses}
      onSubmit={handleSubmit}
      aria-label="Login form"
    >
      {!inDropdown && <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>}
      <div>
        <label htmlFor="login-email" className="block text-sm font-semibold mb-1">
          Email
        </label>
        <input
          id="login-email"
          name="email"
          type="email"
          className={`${inputClasses} ${inputHeight}`}
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
        <label htmlFor="login-password" className="block text-sm font-semibold mb-1">
          Password
        </label>
        <input
          id="login-password"
          name="password"
          type="password"
          className={`${inputClasses} ${inputHeight}`}
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
        className="px-4 py-2 rounded-lg bg-[#14b8a6] text-white font-medium hover:bg-[#0d9488] transition-colors focus:outline-none focus:ring-2 focus:ring-[#14b8a6] focus:ring-offset-2 focus:ring-offset-poll-dark"
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