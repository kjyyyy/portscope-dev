// import AWS from 'aws-sdk';

// // Configure AWS SDK
// AWS.config.update({
//   accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//   secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
//   region: process.env.AWS_REGION,
// });

// /**
//  * Get a pre-configured S3 instance
//  */
// export const getS3 = () => {
//   return new AWS.S3();
// };

// /**
//  * Upload a file to S3
//  * @param {string} bucketName - The name of the S3 bucket
//  * @param {string} fileName - The name of the file
//  * @param {Buffer} fileContent - The content of the file
//  * @param {string} contentType - The content type of the file
//  * @returns {Promise<Object>} - The upload result
//  */
// export const uploadToS3 = async (bucketName, fileName, fileContent, contentType) => {
//   const s3 = getS3();
//   const params = {
//     Bucket: bucketName,
//     Key: fileName,
//     Body: fileContent,
//     ContentType: contentType,
//   };

//   try {
//     const data = await s3.upload(params).promise();
//     return data;
//   } catch (error) {
//     console.error('Error uploading file to S3:', error);
//     throw new Error('Failed to upload file to S3');
//   }
// };

// /**
//  * Delete a file from S3
//  * @param {string} bucketName - The name of the S3 bucket
//  * @param {string} fileName - The name of the file
//  * @returns {Promise<void>}
//  */
// export const deleteFromS3 = async (bucketName, fileName) => {
//   const s3 = getS3();
//   const params = {
//     Bucket: bucketName,
//     Key: fileName,
//   };

//   try {
//     await s3.deleteObject(params).promise();
//   } catch (error) {
//     console.error('Error deleting file from S3:', error);
//     throw new Error('Failed to delete file from S3');
//   }
// };