// import type { NextApiRequest, NextApiResponse } from 'next';
// import { processFile } from '../../../lib/services/dataService';

// // Define the extended request type with file
// interface MulterRequest extends NextApiRequest {
//   file?: Express.Multer.File;
// }

// export default async function handler(req: MulterRequest, res: NextApiResponse) {
//   if (req.method === 'POST') {
//     try {
//       const file = req.file;
//       if (!file) {
//         return res.status(400).json({ error: 'No file uploaded' });
//       }

//       const processedData = await processFile(file);
//       return res.status(200).json(processedData);
//     } catch (error) {
//       console.error('Error processing data:', error);
//       return res.status(500).json({ error: 'Failed to process data' });
//     }
//   } else {
//     return res.status(405).json({ error: 'Method not allowed' });
//   }
// }
