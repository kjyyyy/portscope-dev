import { NextApiRequest, NextApiResponse } from 'next';
import fileService from '../../../lib/services/fileService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  switch (method) {
    case 'POST':
      try {
        const { file } = req.body;
        const result = await fileService.uploadFile(file);
        res.status(200).json({ success: true, data: result });
      } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
      }
      break;

    case 'GET':
      try {
        const { fileId } = req.query;
        const file = await fileService.getFile(fileId as string);
        res.status(200).json({ success: true, data: file });
      } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
      }
      break;

    default:
      res.setHeader('Allow', ['POST', 'GET']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}