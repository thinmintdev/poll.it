import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://YOUR_SUPABASE_URL_HERE';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0c3ZnamV6aHlyenJoZ2hpbHZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk2ODkwMjcsImV4cCI6MjA2NTI2NTAyN30.ragywUSW8m1l7y3HPIMGtf54reMP2Bak99M4FETG9sw';

// Verify admin token - this is a mock verification for development
function verifyAdminToken(token: string): boolean {
  try {
    // Check if the token has the format of a JWT (three parts separated by dots)
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.log('Invalid token format: not 3 parts');
      return false;
    }
    
    // In development, we don't verify the signature, just check the structure
    // In production, you would cryptographically verify the JWT signature
    const base64Payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(Buffer.from(base64Payload, 'base64').toString());
    
    console.log('Token payload:', payload);
    
    // Check if this is our admin user
    if (payload.isAdmin === true && payload.sub === 'admin-user-001') {
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Token verification error:', error);
    return false;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Check for authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized - Missing or invalid Authorization header" });
  }
  
  const token = authHeader.replace("Bearer ", "");
  console.log('Request received with token:', token.substring(0, 20) + '...');
  
  try {
    // Test token verification
    const isValidMockAdmin = verifyAdminToken(token);
    console.log('Is valid mock admin token:', isValidMockAdmin);
    
    // Create a Supabase client - TESTING WITHOUT TOKEN
    // Just creating a basic client to test connection
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Test simple query
    try {
      // Simple test query - just get the count of categories
      const { count, error } = await supabase
        .from('category')
        .select('*', { count: 'exact', head: true });
        
      if (error) {
        console.error('Supabase query error:', error);
        return res.status(500).json({ 
          message: "Supabase query error", 
          error: error.message,
          details: error
        });
      }
      
      return res.status(200).json({ 
        message: "Test successful", 
        isValidMockAdmin,
        categoryCount: count,
        token: token.substring(0, 20) + '...'
      });
    } catch (supabaseError) {
      console.error('Error executing Supabase query:', supabaseError);
      return res.status(500).json({ 
        message: "Error executing Supabase query", 
        error: supabaseError instanceof Error ? supabaseError.message : 'Unknown error'
      });
    }
  } catch (error) {
    console.error('API test error:', error);
    return res.status(500).json({ 
      message: "Internal server error in test endpoint",
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// A simple test to ensure the file is processed by Jest
it('should run a basic test', () => {
  expect(true).toBe(true);
});
