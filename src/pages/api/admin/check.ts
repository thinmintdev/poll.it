import { NextApiRequest, NextApiResponse } from 'next';

// Import the verify function
async function verifyAdminSession(req: NextApiRequest): Promise<{ isAdmin: boolean; username?: string; id?: string; access_token?: string } | null> {
  const adminSessionCookie = req.cookies['admin-session'];

  if (adminSessionCookie) {
    try {
      // In a real scenario with JWT, you'd verify the token cryptographically
      
      // For our mock implementation, simply check if it's our mock cookie value
      if (adminSessionCookie === 'mock-admin-session-token') {
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
    } catch (error) {
      console.error('Session verification failed:', error);
      return null;
    }
  }
  return null;
}

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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // This is a session check endpoint that will be called on load
  if (req.method === 'GET') {
    try {
      // Check if the user has a valid admin session
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
      console.error('Admin check error:', error);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}
