import { NextApiRequest, NextApiResponse } from 'next';
import { setCookie } from 'cookies-next';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ktsvgjezhyrzrhghilvm.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0c3ZnamV6aHlyenJoZ2hpbHZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk2ODkwMjcsImV4cCI6MjA2NTI2NTAyN30.ragywUSW8m1l7y3HPIMGtf54reMP2Bak99M4FETG9sw';

/**
 * Create a simple JWT-formatted token for development purposes.
 * This creates a string that looks like a JWT token but doesn't have real cryptographic security.
 */
function createMockJWT(payload: Record<string, any>): string {
  // Create a base64 encoded header (standard JWT header for HS256)
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64')
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  
  // Create a base64 encoded payload
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64')
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  
  // Create a mock signature (in production, this would be cryptographically signed)
  const mockSignature = Buffer.from('mocksignature12345').toString('base64')
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  
  // Combine to form a JWT-like token: header.payload.signature
  return `${header}.${encodedPayload}.${mockSignature}`;
}

// Verification function for admin sessions
async function verifyAdminSession(req: NextApiRequest): Promise<{ isAdmin: boolean; username?: string; id?: string; access_token?: string } | null> {
  const adminSessionCookie = req.cookies['admin-session'];

  if (adminSessionCookie) {
    try {
      // For development: Mock implementation
      if (process.env.NODE_ENV !== 'production' && adminSessionCookie === 'mock-admin-session-token') {
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
          access_token: mockJWT  // Use our JWT-formatted token
        };
      } 
      else if (process.env.NODE_ENV === 'production') {
        try {
          // In production, we would verify the token with proper cryptography
          // and check against Supabase to confirm admin status
          
          // Create a Supabase client
          const supabase = createClient(supabaseUrl, supabaseAnonKey);
          
          // Decode the token to get the user ID (assuming a proper JWT)
          const tokenData = JSON.parse(Buffer.from(
            adminSessionCookie.split('.')[1], 'base64'
          ).toString());
          
          if (!tokenData || !tokenData.sub) {
            return null;
          }
          
          // Verify with Supabase that this user exists and is an admin
          const { data: profile, error } = await supabase
            .from('profiles')  // Use your actual profile table name
            .select('username, is_admin')
            .eq('id', tokenData.sub)
            .single();
            
          if (error || !profile || !profile.is_admin) {
            return null;
          }
          
          return {
            isAdmin: true,
            username: profile.username,
            id: tokenData.sub,
            access_token: adminSessionCookie  // Pass through the token
          };
        } catch (error) {
          console.error('Production token verification error:', error);
          return null;
        }
      }
    } catch (error) {
      console.error('Session verification failed:', error);
      return null;
    }
  }
  return null;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    // For login requests
    try {
      // This is a simplified mock implementation for development
      const { username, password } = req.body;
      
      if (username === 'admin' && password === 'password') {
        // Set the admin session cookie
        setCookie('admin-session', 'mock-admin-session-token', { 
          req, 
          res, 
          maxAge: 60 * 60 * 24, // 1 day
          path: '/',
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production'
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
