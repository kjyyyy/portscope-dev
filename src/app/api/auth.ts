// import { NextApiRequest, NextApiResponse } from 'next';
// import authService from 'authService';

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   const { method } = req;

//   switch (method) {
//     case 'POST':
//       try {
//         const { email, password, name } = req.body;

//         if (email && password && name) {
//           // Handle registration
//           const { user, token } = await authService.register(email, password, name);
//           res.status(201).json({ success: true, data: user, token });
//         } else {
//           // Handle login
//           const { user, token } = await authService.login(email, password);
//           if (user) {
//             res.status(200).json({ success: true, data: user, token });
//           } else {
//             res.status(401).json({ success: false, message: 'Invalid credentials' });
//           }
//         }
//       } catch {
//         res.status(500).json({ success: false, message: 'Server error' });
//       }
//       break;

//     case 'GET':
//       try {
//         const { authorization } = req.headers;
//         if (authorization) {
//           const token = authorization.split(' ')[1];
//           const user = authService.validateToken(token);
//           if (user) {
//             res.status(200).json({ success: true, data: user });
//           } else {
//             res.status(401).json({ success: false, message: 'Invalid token' });
//           }
//         } else {
//           res.status(401).json({ success: false, message: 'No token provided' });
//         }
//       } catch {
//         res.status(500).json({ success: false, message: 'Server error' });
//       }
//       break;

//     default:
//       res.setHeader('Allow', ['POST', 'GET']);
//       res.status(405).end(`Method ${method} Not Allowed`);
//   }
// }