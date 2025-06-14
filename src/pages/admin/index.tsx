'use client';

import { useEffect, useState, FC } from 'react';
import {
  AdminLayout,
  SidebarSection,
  StatusAlert,
  LoadingSpinner as PageSpinner,
  DynamicPollsTabs,
  DynamicCategoriesTabs,
  DynamicUsersTabs,
  DynamicProfileTabs,
  SIDEBAR_ITEMS // Import SIDEBAR_ITEMS to correctly type SidebarSection
} from '@/components/admin';
import { AdminSession } from '@/types/admin';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const AdminPanel: FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  // For the temp login form
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState(''); // For production login
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  // Initialize with a default valid section from SIDEBAR_ITEMS
  const [activeSection, setActiveSection] = useState<SidebarSection>(SIDEBAR_ITEMS[0].label);
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<AdminSession | null>(null);
  const [sidebarMinimized, setSidebarMinimized] = useState<boolean>(false);
  
  useEffect(() => {
    const minimized = localStorage.getItem("adminSidebarMinimized");
    setSidebarMinimized(minimized === "true");
  }, []);

  useEffect(() => {
    localStorage.setItem("adminSidebarMinimized", sidebarMinimized ? "true" : "false");
  }, [sidebarMinimized]);

  // Handle login submission
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthenticating(true);
    setError(null);
    
    try {
      // Determine credentials based on environment
      const credentials = process.env.NODE_ENV !== 'production' 
        ? { username, password }
        : { email, password };
      
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });
      
      if (!res.ok) {
        if (res.status === 401) {
          throw new Error('Invalid credentials');
        } else {
          throw new Error(`Server error: ${res.statusText}`);
        }
      }
      
      const data = await res.json();
      
      if (data && data.session && data.session.isAdmin) {
        setSession(data.session);
        setIsAdmin(true);
      } else {
        throw new Error('Admin privileges not found in session.');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during login.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  useEffect(() => {
    const checkAdmin = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Use the check endpoint for admin auth check
        const res = await fetch('/api/admin/check'); 
        
        if (!res.ok) {
          if (res.status === 401 || res.status === 403) {
            throw new Error('You must be an admin to access this page.');
          } else {
            // Capture more generic server errors
            const errorData = await res.json().catch(() => ({ message: `Server error: ${res.statusText}` }));
            throw new Error(errorData.message || `Server error: ${res.statusText}`);
          }
        }
        
        const data = await res.json();

        if (data && data.session && data.session.isAdmin) {
          setSession(data.session);
          setIsAdmin(true);
        } else {
          throw new Error('Admin privileges not found in session or session is invalid.');
        }
      } catch (err: any) {
        setError(err.message || 'An unexpected error occurred while verifying admin status.');
        setIsAdmin(false);
        setSession(null);
      } finally {
        setIsLoading(false);
      }
    };
    checkAdmin();
  }, []);

  const renderContent = () => {
    if (!isAdmin || !session) {
      // This case should ideally be handled by the top-level error/loading check,
      // but as a safeguard:
      return null; 
    }

    switch (activeSection) {
      case "Polls":
        return <DynamicPollsTabs session={session} />;
      case "Categories":
        return <DynamicCategoriesTabs session={session} />;
      case "Users":
        // Pass session to UsersTabs since it needs the token for API calls
        return <DynamicUsersTabs session={session} />;
      case "Profile":
        // Pass session to ProfileTabs since it likely needs the token too
        return <DynamicProfileTabs session={session} />;
      default:
        // Handle unknown sections, perhaps by logging or showing a specific message
        console.warn(`Unknown admin section: ${activeSection}`);
        return <div>Selected section not found. Please choose from the sidebar.</div>;
    }
  };

  if (isLoading) {
    return <PageSpinner />;
  }

  if (error || !isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-100 dark:bg-gray-900">
        {error && (
          <StatusAlert
            error={error}
            className="max-w-md w-full shadow-lg mb-6"
            onClose={() => setError(null)} 
          />
        )}
        
        {/* Simple login form for development/testing */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full">
          <h1 className="text-2xl font-bold mb-6 text-center">Admin Login</h1>
          
          <form onSubmit={handleLogin} className="space-y-4">
            {process.env.NODE_ENV !== 'production' ? (
              // Development login
              <div>
                <label htmlFor="username" className="block text-sm font-medium mb-1">
                  Username
                </label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  required
                />
              </div>
            ) : (
              // Production login
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  required
                />
              </div>
            )}
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1">
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="password"
                required
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full"
              disabled={isAuthenticating}
            >
              {isAuthenticating ? 'Logging in...' : 'Login'}
            </Button>
            
            {!error && process.env.NODE_ENV !== 'production' && (
              <p className="text-sm text-gray-500 text-center mt-4">
                For testing, use username: <strong>admin</strong> and password: <strong>password</strong>
              </p>
            )}
          </form>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout
      activeSection={activeSection}
      onSectionChange={setActiveSection}
      isMinimized={sidebarMinimized}
      onToggleMinimize={() => setSidebarMinimized(prev => !prev)}
      adminUsername={session?.username || 'Admin'} // Pass username to layout
    >
      {renderContent()}
    </AdminLayout>
  );
};

export default AdminPanel;