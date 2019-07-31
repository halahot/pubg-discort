const CommonService = require('../src/services/common-service.js');
const Pool = require('pg');
// import * as logger from './logger.config';

const connectionString = CommonService.getEnvironmentVariable('DATABASE_URL');
const pool = new Pool({ connectionString: connectionString, ssl: true });
pool.on('error', () => {
  // logger.error('Unexpected error on idle client', err);
  process.exit(-1);
});

module.exports = pool;
