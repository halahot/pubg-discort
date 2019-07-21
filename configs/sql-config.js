import { CommonService } from '../src/services/common-service.js';
import { Pool } from 'pg';
// import * as logger from './logger.config';


const connectionString = CommonService.getEnvironmentVariable('DATABASE_URL');
const pool = new Pool({ connectionString: connectionString, ssl: true });
pool.on('error', (err) => {
    // logger.error('Unexpected error on idle client', err);
    process.exit(-1);
});

export default pool;