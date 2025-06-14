import React from "react";
import LoginForm from "../components/LoginForm";

const LoginPage: React.FC = () => (
  <main className="flex min-h-[calc(100vh-5rem)] items-center justify-center bg-background text-foreground transition-colors duration-300">
    <LoginForm />
  </main>
);

export default LoginPage;