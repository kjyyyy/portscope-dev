// import { NextApiRequest, NextApiResponse } from 'next';
// import { uploadFile } from './controllers/fileController';
// import multer from 'multer';
// import nextConnect from 'next-connect';

// const upload = multer();

// export const config = {
//   api: {
//     bodyParser: false, // Disable body parsing, since we're using multer
//   },
// };

// declare module 'next-connect' {
//   interface Request {
//     file?: Express.Multer.File;
//   }
// }

// const handler = nextConnect()
//   .use(upload.single('file'))
//   .post(async (req: NextApiRequest, res: NextApiResponse) => {
//     try {
//       if (!req.file) {
//         return res.status(400).json({ success: false, message: 'No file uploaded' });
//       }
//       await uploadFile(req, res);
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({ success: false, message: 'Server error' });
//     }
//   });

// export default handler;