import { NextApiRequest, NextApiResponse } from 'next';
import dataService from '../../../lib/services/dataService.ts';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  switch (method) {
    case 'POST':
      try {
        const { data } = req.body;
        const result = await dataService.processData(data);
        res.status(200).json({ success: true, data: result });
      } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
      }
      break;

    case 'GET':
      try {
        const { dataId } = req.query;
        const data = await dataService.getData(dataId as string);
        res.status(200).json({ success: true, data: data });
      } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
      }
      break;

    default:
      res.setHeader('Allow', ['POST', 'GET']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}