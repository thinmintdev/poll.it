import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AdminLayout } from '@/components/admin';

export default function ApiTest() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Get token from session
    const getToken = async () => {
      try {
        const res = await fetch('/api/admin/auth');
        if (res.ok) {
          const data = await res.json();
          if (data.session?.access_token) {
            setToken(data.session.access_token);
          }
        }
      } catch (err) {
        console.error('Error getting token:', err);
      }
    };
    
    getToken();
  }, []);

  const testApi = async () => {
    if (!token) {
      setError('No token available. Please login first.');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Test the API endpoint
      const res = await fetch('/api/admin/test', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      const data = await res.json();
      setResult(data);
      
      if (!res.ok) {
        throw new Error(data.message || 'API test failed');
      }
    } catch (err) {
      console.error('Test API error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const testCategoriesApi = async () => {
    if (!token) {
      setError('No token available. Please login first.');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Test the categories API endpoint
      const res = await fetch('/api/admin/categories', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      const data = await res.json();
      setResult(data);
      
      if (!res.ok) {
        throw new Error(data.message || 'Categories API test failed');
      }
    } catch (err) {
      console.error('Categories API error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout 
      activeSection="Polls" 
      onSectionChange={() => {}} 
      isMinimized={false} 
      onToggleMinimize={() => {}}
    >
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">API Test Page</h1>
        
        <div className="mb-4">
          <p className="mb-2">Token status: {token ? 'Available' : 'Not available'}</p>
          {token && (
            <p className="text-xs mb-4 max-w-lg overflow-hidden text-ellipsis">
              Token: {token.substring(0, 20)}...
            </p>
          )}
        </div>
        
        <div className="flex gap-4 mb-6">
          <Button 
            onClick={testApi} 
            disabled={loading || !token}
          >
            Test Connection
          </Button>
          
          <Button 
            onClick={testCategoriesApi} 
            disabled={loading || !token}
            variant="outline"
          >
            Test Categories API
          </Button>
        </div>
        
        {loading && <p>Loading...</p>}
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p><strong>Error:</strong> {error}</p>
          </div>
        )}
        
        {result && (
          <div className="bg-gray-100 p-4 rounded-md">
            <h2 className="font-bold mb-2">Result:</h2>
            <pre className="whitespace-pre-wrap overflow-auto max-h-96">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
