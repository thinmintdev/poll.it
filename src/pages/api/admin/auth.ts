import { NextApiRequest, NextApiResponse } from 'next';
import { setCookie } from 'cookies-next';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://YOUR_SUPABASE_URL_HERE';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0c3ZnamV6aHlyenJoZ2hpbHZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk2ODkwMjcsImV4cCI6MjA2NTI2NTAyN30.ragywUSW8m1l7y3HPIMGtf54reMP2Bak99M4FETG9sw';
// Service role key - should only be used server-side for admin operations
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

/**
 * Create a simple JWT-formatted token for development purposes only.
 * This creates a string that looks like a JWT token but doesn't have real cryptographic security.
 * NEVER use this in production!
 */
function createMockJWT(payload: Record<string, any>): string {
  if (process.env.NODE_ENV === 'production') {
    console.error('Attempted to create mock JWT in production environment!');
    throw new Error('Mock JWT creation is not allowed in production');
  }
  
  // Create a base64 encoded header (standard JWT header for HS256)
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64')
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  
  // Create a base64 encoded payload
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64')
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  
  // Create a mock signature (in development only)
  const mockSignature = Buffer.from('mocksignature12345').toString('base64')
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  
  // Combine to form a JWT-like token: header.payload.signature
  return `${header}.${encodedPayload}.${mockSignature}`;
}

// Verification function for admin sessions
async function verifyAdminSession(req: NextApiRequest): Promise<{ isAdmin: boolean; username?: string; id?: string; access_token?: string } | null> {
  const adminSessionCookie = req.cookies['admin-session'];

  if (!adminSessionCookie) {
    return null;
  }
  
  try {
    // Create a Supabase client with the anon key
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // In development environment only: support mock admin session
    if (process.env.NODE_ENV !== 'production' && adminSessionCookie === 'mock-admin-session-token') {
      console.log('Using mock admin session in development environment');
      
      // Create a proper JWT-formatted token for Supabase to accept
      const mockJWT = createMockJWT({
        sub: 'admin-user-001',
        username: 'MockAdmin',
        isAdmin: true,
        exp: Math.floor(Date.now() / 1000) + 86400, // 24 hours from now
        iat: Math.floor(Date.now() / 1000)
      });
      
      return { 
        isAdmin: true, 
        username: 'MockAdmin', 
        id: 'admin-user-001',
        access_token: mockJWT
      };
    } 
    
    // For all environments (including production): Verify the token with Supabase
    try {
      // Try to decode the token to get the user ID
      let tokenData;
      try {
        const tokenParts = adminSessionCookie.split('.');
        if (tokenParts.length !== 3) {
          throw new Error('Invalid token format');
        }
        
        tokenData = JSON.parse(Buffer.from(
          tokenParts[1], 'base64'
        ).toString());
      } catch (decodeError) {
        console.error('Token decode error:', decodeError);
        return null;
      }
      
      if (!tokenData || !tokenData.sub) {
        return null;
      }
      
      // Verify with Supabase that this user exists and is an admin
      // Use service role key if available to bypass RLS policies
      const adminSupabase = supabaseServiceKey 
        ? createClient(supabaseUrl, supabaseServiceKey)
        : supabase;
      
      // First try to get the user with auth.getUser
      const { data: userData, error: userError } = await adminSupabase.auth.getUser(adminSessionCookie);
      
      if (userError || !userData?.user) {
        console.error('Invalid user token:', userError);
        return null;
      }
      
      // Then check if the user has admin privileges in the profiles table
      const { data: profile, error: profileError } = await adminSupabase
        .from("profiles")
        .select("username, is_admin")
        .eq("id", userData.user.id)
        .single();
        
      if (profileError) {
        console.error('Error fetching admin status:', profileError);
        return null;
      }
      
      if (!profile?.is_admin) {
        console.warn('User attempted admin access but is not an admin:', userData.user.id);
        return null;
      }
      
      return {
        isAdmin: true,
        username: profile.username,
        id: userData.user.id,
        access_token: adminSessionCookie
      };
    } catch (authError) {
      console.error('Authentication error:', authError);
      return null;
    }
  } catch (error) {
    console.error('Session verification failed:', error);
    return null;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    // For login requests
    try {
      // DEVELOPMENT ONLY: Simple mock authentication
      if (process.env.NODE_ENV !== 'production') {
        const { username, password } = req.body;
        
        if (username === 'admin' && password === 'password') {
          // Set the admin session cookie
          setCookie('admin-session', 'mock-admin-session-token', { 
            req, 
            res, 
            maxAge: 60 * 60 * 24, // 1 day
            path: '/',
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production' ? true : false
          });
          
          // Create a proper JWT-formatted token for Supabase
          const mockJWT = createMockJWT({
            sub: 'admin-user-001',
            username: 'MockAdmin',
            isAdmin: true,
            exp: Math.floor(Date.now() / 1000) + 86400, // 24 hours from now
            iat: Math.floor(Date.now() / 1000)
          });
          
          // Return session with our JWT-formatted token
          return res.status(200).json({ 
            session: {
              id: 'admin-user-001',
              username: 'MockAdmin',
              isAdmin: true,
              access_token: mockJWT
            }
          });
        } else {
          return res.status(401).json({ message: 'Invalid credentials' });
        }
      } else {
        // PRODUCTION: Use real Supabase authentication
        const { email, password } = req.body;
        
        // Validate input
        if (!email || !password) {
          return res.status(400).json({ message: 'Email and password are required' });
        }
        
        // Create a Supabase client
        const supabase = createClient(supabaseUrl, supabaseAnonKey);
        
        // Authenticate with Supabase
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        
        if (error || !data?.session) {
          return res.status(401).json({ message: 'Invalid credentials' });
        }
        
        // Use service role key if available to bypass RLS policies
        const adminSupabase = supabaseServiceKey 
          ? createClient(supabaseUrl, supabaseServiceKey)
          : supabase;
        
        // Check if the user is an admin
        const { data: profile, error: profileError } = await adminSupabase
          .from("profiles")
          .select("username, is_admin")
          .eq("id", data.user.id)
          .single();
          
        if (profileError || !profile?.is_admin) {
          return res.status(403).json({ message: 'User does not have admin privileges' });
        }
        
        // Set the admin session cookie with the actual Supabase token
        setCookie('admin-session', data.session.access_token, { 
          req, 
          res, 
          maxAge: 60 * 60 * 24, // 1 day
          path: '/',
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production' ? true : false
        });
        
        // Return the session
        return res.status(200).json({ 
          session: {
            id: data.user.id,
            username: profile.username,
            isAdmin: true,
            access_token: data.session.access_token
          }
        });
      }
    } catch (error) {
      console.error('Admin login error:', error);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  } else if (req.method === 'GET') {
    // For session verification
    try {
      const session = await verifyAdminSession(req);

      if (session && session.isAdmin) {
        return res.status(200).json({ 
          session,
          message: 'Admin session is valid'
        });
      } else {
        return res.status(401).json({ message: 'No valid admin session found' });
      }
    } catch (error) {
      console.error('Admin auth API error:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
