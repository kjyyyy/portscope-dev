// import { uploadToS3, deleteFromS3 } from '../utils/aws';
// //import { FileUploadResult } from '../../types/fileTypes';

// export const uploadFileToS3 = async (file: Express.Multer.File): Promise<FileUploadResult> => {
//   try {
//     const bucketName = process.env.AWS_S3_BUCKET_NAME || '';
//     const fileName = `${Date.now()}_${file.originalname}`;
//     const contentType = file.mimetype;

//     const result = await uploadToS3(bucketName, fileName, file.buffer, contentType);

//     return {
//       success: true,
//       url: result.Location,
//       key: result.Key,
//       bucket: result.Bucket,
//     };
//   } catch (error) {
//     console.error('Error uploading file to S3:', error);
//     return {
//       success: false,
//       message: 'Failed to upload file to S3',
//     };
//   }
// };

// export const deleteFileFromS3 = async (key: string): Promise<boolean> => {
//   try {
//     const bucketName = process.env.AWS_S3_BUCKET_NAME || '';
//     await deleteFromS3(bucketName, key);
//     return true;
//   } catch (error) {
//     console.error('Error deleting file from S3:', error);
//     return false;
//   }
// };