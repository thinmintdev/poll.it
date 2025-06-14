import React, { useEffect } from "react";
import { useRouter } from "next/router";

const LoginPage: React.FC = () => {
  const router = useRouter();

  useEffect(() => {
    // Check if the page was directly accessed and show a message before redirecting
    if (typeof window !== "undefined") {
      // Optional: Add a small delay to show the message
      const timer = setTimeout(() => {
        router.push("/");
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center bg-background text-foreground transition-colors duration-300 py-8">
      <div className="max-w-md w-full mx-auto bg-card dark:bg-poll-darker shadow-lg rounded-lg p-8 border border-border">
        <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>
        <p className="mb-6 text-center text-poll-grey-100">
          The login form is now available in the header. You will be redirected to
          the home page in a few seconds.
        </p>
        <div className="flex justify-center">
          <button
            onClick={() => router.push("/")}
            className="px-4 py-2 rounded-lg bg-[#14b8a6] text-white font-medium hover:bg-[#0d9488] transition-colors focus:outline-none focus:ring-2 focus:ring-[#14b8a6] focus:ring-offset-2 focus:ring-offset-poll-dark"
          >
            Go to Home Page
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;