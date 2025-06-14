import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // This is a session check endpoint that will be called on load
  if (req.method === 'GET') {
    try {
      // Forward to the auth endpoint GET handler which verifies sessions
      // Use the same cookie from the incoming request
      const authRes = await fetch(`http://${req.headers.host}/api/admin/auth`, {
        method: 'GET',
        headers: {
          'Cookie': req.headers.cookie || ''
        }
      });
      
      // Return the same status code and response from auth endpoint
      const data = await authRes.json();
      return res.status(authRes.status).json(data);
    } catch (error) {
      console.error('Admin check error:', error);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}
