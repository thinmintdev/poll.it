import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { supabase } from "../utils/supabaseClient";
import { ChevronDownIcon, ArrowRightOnRectangleIcon, UserCircleIcon, Cog6ToothIcon, MoonIcon, SunIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import LoginForm from "./LoginForm";

const Header: React.FC = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loginDropdownOpen, setLoginDropdownOpen] = useState(false);
  const [theme, setTheme] = useState<string>("light");
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const loginDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkSessionAndAdmin = async () => {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      if (!session) {
        setIsAdmin(false);
        setProfile(null);
        setLoading(false);
        return;
      }
      const { data: profile } = await supabase
        .from("profiles")
        .select("id, is_admin, avatar_url, display_name, username")
        .eq("id", session.user.id)
        .single();
      setIsAdmin(!!profile?.is_admin);
      setProfile(profile);
      setLoading(false);
    };
    checkSessionAndAdmin();
  }, [router.pathname]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
      if (loginDropdownRef.current && !loginDropdownRef.current.contains(e.target as Node)) {
        setLoginDropdownOpen(false);
      }
    };
    
    if (dropdownOpen || loginDropdownOpen) {
      document.addEventListener("mousedown", handleClick);
    } else {
      document.removeEventListener("mousedown", handleClick);
    }
    return () => document.removeEventListener("mousedown", handleClick);
  }, [dropdownOpen, loginDropdownOpen]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setDropdownOpen(false);
    router.push("/");
  };

  const avatarUrl = profile?.avatar_url || "/default-avatar.png";
  const displayName = profile?.display_name || profile?.username || "User";

  useEffect(() => {
    // On mount, set theme from localStorage or system
    const saved = typeof window !== "undefined" ? localStorage.getItem("theme") : null;
    if (saved === "dark" || (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      document.documentElement.classList.add("dark");
      setTheme("dark");
    } else {
      document.documentElement.classList.remove("dark");
      setTheme("light");
    }
  }, []);

  const toggleTheme = () => {
    if (theme === "dark") {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setTheme("light");
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setTheme("dark");
    }
  };

  // Handle successful login
  const onLoginSuccess = () => {
    setLoginDropdownOpen(false);
    router.push(router.pathname); // Refresh the current page to update session state
  };

  return (
    <header className="w-full fixed top-0 left-0 z-50 bg-poll-dark/80 backdrop-blur border-b border-poll-grey-700">
      <nav className="container max-w-6xl mx-auto flex items-center justify-between py-3 px-4">
        <Link href="/" className="text-2xl font-bold text-white hover:opacity-90 transition-opacity focus:outline-none focus:opacity-90" aria-label="Go to homepage">
          Poll<span className="text-[#14b8a6]">.it</span>
        </Link>
        <div className="flex items-center gap-4">
          
          {/* Login dropdown if not logged in */}
          {!loading && !session && (
            <div className="relative" ref={loginDropdownRef}>
              <button 
                className="px-4 py-2 rounded-lg bg-[#14b8a6] text-white font-medium hover:bg-[#0d9488] transition-colors focus:outline-none focus:ring-2 focus:ring-[#14b8a6] focus:ring-offset-2 focus:ring-offset-poll-dark flex items-center gap-1"
                aria-label="Open login form"
                onClick={() => setLoginDropdownOpen(!loginDropdownOpen)}
              >
                Login <ChevronDownIcon className="w-4 h-4 ml-1" />
              </button>
              {loginDropdownOpen && (
                <div className="absolute right-0 mt-3 w-72 bg-poll-dark border-b border-l border-r border-poll-grey-700 rounded-bl-lg shadow-lg pb-4 z-50 animate-fade-in-and-out duration-500">
                  <LoginForm inDropdown onLoginSuccess={onLoginSuccess} />
                </div>
              )}
            </div>
          )}
          
          {/* User avatar and dropdown if logged in */}
          {!loading && session && profile && (
            <div className="relative" ref={dropdownRef}>
              <button
                className="flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-[#14b8a6] rounded-full p-1"
                onClick={() => setDropdownOpen((v) => !v)}
                aria-label="Open user menu"
                tabIndex={0}
              >
                <Image
                  src={avatarUrl}
                  alt="User avatar"
                  width={36}
                  height={36}
                  className="w-9 h-9 rounded-full object-cover border border-poll-grey-700 bg-poll-grey-800"
                  priority
                />
                <ChevronDownIcon className="w-5 h-5 text-poll-grey-100" />
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-poll-dark border border-poll-grey-700 rounded-lg shadow-lg py-2 z-50 animate-fade-in">
                  <div className="px-4 py-2 text-sm text-poll-grey-100 font-semibold border-b border-poll-grey-700 flex items-center gap-2">
                    <UserCircleIcon className="w-5 h-5 text-[#14b8a6]" />
                    {displayName}
                  </div>
                  <Link
                    href="/profile"
                    className="px-4 py-2 text-poll-grey-100 hover:bg-poll-grey-800/50 flex items-center gap-2 transition-colors"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <UserCircleIcon className="w-5 h-5" /> Profile
                  </Link>
                  {isAdmin && (
                    <Link
                      href="/admin"
                      className="px-4 py-2 text-poll-grey-100 hover:bg-poll-grey-800/50 flex items-center gap-2 transition-colors"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <Cog6ToothIcon className="w-5 h-5" /> Admin Panel
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-poll-grey-100 hover:bg-poll-grey-800/50 flex items-center gap-2 transition-colors"
                  >
                    <ArrowRightOnRectangleIcon className="w-5 h-5" /> Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;