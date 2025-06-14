import React from "react";
import LoginForm from "../components/LoginForm";

const LoginPage: React.FC = () => (
  <div className="flex items-center justify-center bg-background text-foreground transition-colors duration-300 py-8">
    <LoginForm />
  </div>
);

export default LoginPage;