const csv = require('fast-csv');
const bucket = require('../config/firebase');
const logger = require('../config/logger');

class CsvService {
  /**
   * Universal Cloud Ingestion Engine
   * @param {Object} fileBufferObject - The raw file buffer passed down by Multer (req.file)
   * @param {string} destinationFolder - Cloud directory workspace ('rates', 'drivers', etc.)
   * @param {mongoose.Model} targetModel - Target Mongoose model to batch write records into
   * @param {Array<string>} requiredHeaders - Mandatory column names checklist array
   */
  async uploadAndProcessBulkImport(fileBufferObject, destinationFolder, targetModel, requiredHeaders) {
    return new Promise(async (resolve, reject) => {
      try {
        if (!fileBufferObject) {
          const error = new Error('File payload missing. Please upload a structured CSV file multipart asset.');
          error.statusCode = 400;
          return reject(error);
        }

        // 1. Establish isolated cloud filepath string
        const uniqueFileName = `${destinationFolder}/${Date.now()}-${fileBufferObject.originalname}`;
        const blob = bucket.file(uniqueFileName);

        // 2. Open an upload stream straight up to our Firebase Cloud bucket
        const blobStream = blob.createWriteStream({
          metadata: { contentType: fileBufferObject.mimetype }
        });

        blobStream.on('error', (err) => reject(err));

        blobStream.on('finish', () => {
          logger.info(`Backup copy securely locked into Firebase storage: ${uniqueFileName}`);

          const recordsToInsert = [];
          let isHeaderVerified = false;

          // 3. Open a download readable stream directly from the cloud file
          const cloudReadStream = blob.createReadStream();

          const csvStream = csv.parse({ headers: true, trim: true })
            .on('headers', (headers) => {
              // Structural Integrity Check: Do the uploaded columns match our expectation array?
              const match = requiredHeaders.every(h => headers.includes(h));
              if (!match) {
                const error = new Error(`CSV layout mismatch. Missing or broken schema columns. Expected fields: [${requiredHeaders.join(', ')}]`);
                error.statusCode = 400;
                return csvStream.destroy(error);
              }
              isHeaderVerified = true;
            })
            .on('data', (row) => {
              // Accumulate sanitized object rows into memory array
              recordsToInsert.push(row);
            })
            .on('error', async (csvError) => {
              // Self-healing: Delete the invalid file from Firebase if parsing fails
              await blob.delete().catch(e => logger.error(`Cloud leak cleanup failed: ${e.message}`));
              reject(csvError);
            })
            .on('end', async () => {
              try {
                if (!isHeaderVerified) throw new Error('Data Ingestion Stopped: Structural headers were missing.');
                if (recordsToInsert.length === 0) throw new Error('Uploaded CSV file contains zero active data rows.');

                // 4. Batch Optimization: Fast-insert array directly to MongoDB in single request payload
                await targetModel.insertMany(recordsToInsert, { ordered: false });
                
                logger.info(`Bulk upload success: ${recordsToInsert.length} entries written to [${targetModel.modelName}] collection.`);
                
                resolve({ 
                  success: true, 
                  insertedCount: recordsToInsert.length,
                  cloudStoragePath: uniqueFileName 
                });
              } catch (batchError) {
                await blob.delete().catch(e => logger.error(`Cloud leak cleanup failed: ${e.message}`));
                reject(batchError);
              }
            });

          // Pipe the network stream bytes straight into the parser
          cloudReadStream.pipe(csvStream);
        });

        // Push the final buffer bits down the tube to finalize upload execution
        blobStream.end(fileBufferObject.buffer);

      } catch (outerError) {
        reject(outerError);
      }
    });
  }
}

module.exports = new CsvService();