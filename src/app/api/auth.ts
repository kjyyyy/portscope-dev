import { NextApiRequest, NextApiResponse } from 'next';
import { signIn, signOut, getSession } from 'next-auth/client';
import authService from '../../../lib/services/authService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  switch (method) {
    case 'POST':
      try {
        const { email, password } = req.body;
        const user = await authService.login(email, password);
        if (user) {
          await signIn('credentials', { redirect: false, email, password });
          res.status(200).json({ success: true, data: user });
        } else {
          res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
      } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
      }
      break;

    case 'DELETE':
      try {
        await signOut({ redirect: false });
        res.status(200).json({ success: true, message: 'Signed out successfully' });
      } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
      }
      break;

    case 'GET':
      try {
        const session = await getSession({ req });
        if (session) {
          res.status(200).json({ success: true, data: session });
        } else {
          res.status(401).json({ success: false, message: 'Not authenticated' });
        }
      } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
      }
      break;

    default:
      res.setHeader('Allow', ['POST', 'DELETE', 'GET']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}