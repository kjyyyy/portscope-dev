// import { Request, Response } from 'express';
// import { uploadFileToS3 } from '../../../lib/services/fileService';
// import { UploadedFile } from '../../../types/fileTypes';

// interface MulterFile {
//   originalname: string;
//   buffer: Buffer;
//   size: number;
//   mimetype: string;
// }

// declare module 'express-serve-static-core' {
//   interface Request {
//     file?: MulterFile;
//   }
// }

// export const uploadFile = async (req: Request, res: Response) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({ success: false, message: 'No file uploaded' });
//     }

//     const uploadedFile: UploadedFile = await uploadFileToS3(req.file);
//     res.status(200).json({ success: true, data: uploadedFile });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false, message: 'Failed to upload file' });
//   }
// };

// export const getFiles = async (req: Request, res: Response) => {
//   try {
//     // In a real implementation, this would query a database
//     const files = [
//       { id: '1', name: 'file1.xlsx', url: '/files/file1.xlsx', size: 1024, type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', uploadedAt: new Date(), userId: 'user-id', status: 'pending' },
//       { id: '2', name: 'file2.xlsx', url: '/files/file2.xlsx', size: 2048, type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', uploadedAt: new Date(), userId: 'user-id', status: 'processed' }
//     ];
//     res.status(200).json(files);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Failed to retrieve files' });
//   }
// };

// export const getProcessedData = async (req: Request, res: Response) => {
//   try {
//     // In a real implementation, this would process the file data
//     const processedData = {
//       fileId: req.query.fileId,
//       data: [
//         { column1: 'value1', column2: 'value2' },
//         { column1: 'value3', column2: 'value4' }
//       ]
//     };
//     res.status(200).json(processedData);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Failed to retrieve processed data' });
//   }
// };