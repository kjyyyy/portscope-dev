// import * as XLSX from 'xlsx';

// /**
//  * Read data from an Excel file
//  * @param {Buffer} fileBuffer - The file buffer
//  * @returns {Promise<any[]>} - The parsed data
//  */
// export const readExcelFile = (fileBuffer: Buffer): Promise<any[]> => {
//   return new Promise((resolve, reject) => {
//     try {
//       const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
//       const sheetName = workbook.SheetNames[0];
//       const worksheet = workbook.Sheets[sheetName];
//       const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
//       resolve(jsonData);
//     } catch (error) {
//       reject(new Error('Failed to read Excel file'));
//     }
//   });
// };

// /**
//  * Write data to an Excel file
//  * @param {any[]} data - The data to write
//  * @returns {Buffer} - The Excel file buffer
//  */
// export const writeExcelFile = (data: any[]): Buffer => {
//   const worksheet = XLSX.utils.aoa_to_sheet(data);
//   const workbook = XLSX.utils.book_new();
//   XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
//   return XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });
// };