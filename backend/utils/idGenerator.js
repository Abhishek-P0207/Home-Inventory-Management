import { randomBytes } from 'crypto';

export default class IdGenerator {
    /**
     * Generate a unique ID using crypto.randomBytes
     * @param {number} length - Length of the ID (default: 12)
     * @returns {string} - Unique ID string
     */
    static generateId(length = 12) {
        return randomBytes(length).toString('hex');
    }

    /**
     * Generate a timestamp-based unique ID
     * @returns {string} - Unique ID with timestamp prefix
     */
    static generateTimestampId() {
        const timestamp = Date.now().toString(36);
        const randomPart = randomBytes(6).toString('hex');
        return `${timestamp}_${randomPart}`;
    }

    /**
     * Generate a UUID-like string
     * @returns {string} - UUID-like unique ID
     */
    static generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
}