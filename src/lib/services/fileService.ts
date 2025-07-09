import AWS from 'aws-sdk';
import { UploadedFile } from '../../types/fileTypes';

interface MulterFile {
  originalname: string;
  buffer: Buffer;
  size: number;
  mimetype: string;
}

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

export const uploadFileToS3 = async (file: MulterFile): Promise<UploadedFile> => {
  const params = {
    Bucket: process.env.AWS_S3_BUCKET,
    Key: `${Date.now()}_${file.originalname}`,
    Body: file.buffer,
    ContentType: file.mimetype,
  };

  try {
    const data = await s3.upload(params).promise();
    return {
      id: data.Key,
      name: file.originalname,
      url: data.Location,
      size: file.size,
      type: file.mimetype,
      uploadedAt: new Date(),
      userId: 'user-id', // Replace with actual user ID
      status: 'pending',
    };
  } catch (error) {
    console.error(error);
    throw new Error('Failed to upload file to S3');
  }
};