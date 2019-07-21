import * as NodeCache from 'node-cache';
// import * as logger from '../config/logger.config';
import { TimeInSeconds } from '../shared/constants';


/**
 * A caching service wrapper
 */
export default class CacheService {

    /**
     * Creates a node-cache object
     * @param {number} ttlSeconds time in seconds until cache is invalid - defaults to 1 hour
     */
    constructor(ttlSeconds = TimeInSeconds.ONE_HOUR) {
        
        this.cache = new NodeCache({
            stdTTL: ttl,
            checkperiod: ttl * 0.1,
            useClones: false
        });
    }

    /**
     * Gets / Sets the cache
     * @param {string} key
     * @param {Function} storeFunction
     * @returns {Promise<T>}
     */
    get(key, storeFunction, ttl) {
        const value= this.cache.get(key);
        if (value) {
            //logger.info(`CACHED: ${key}`);
            return Promise.resolve(value);
        }

        return this.put(key, storeFunction, ttl);
    }

    /**
     * Sets the cache with a key/value pair
     * @param key
     * @param storeFunction
     * @returns {Promise<T>}
     */
    put(key, storeFunction, ttl) {
        return storeFunction().then((result) => {
            //logger.info(`CACHING: ${key}`);
            this.cache.set(key, result, ttl);
            return result;
        });
    }

    del(keys) {
        // logger.info(`Cache-del: ${keys}`);
        this.cache.del(keys);
    }

    delStartWith(startStr = '') {
        if (!startStr) {
            return;
        }

        const keys = this.cache.keys();
        for (const key of keys) {
            if (key.indexOf(startStr) === 0) {
                this.del(key);
            }
        }
    }

    /**
     * Flushes the entire cache
     */
    flush() {
        //logger.info('Cache-flush');
        this.cache.flushAll();
    }
}