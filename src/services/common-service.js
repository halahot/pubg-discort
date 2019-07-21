require('dotenv').config();


export default class CommonService {

    static singleLineString = (strings, ...values) => {
        let output = '';
        for (let i = 0; i < values.length; i++) {
          output += strings[i] + values[i];
        }
        output += strings[values.length];

        // Split on newlines.
        let lines = output.split(/(?:\r\n|\n|\r)/);

        // Rip out the leading whitespace.
        return lines.map((line) => {
          return line.replace(/^\s+/gm, '');
        }).join(' ').trim();
    }

    static multiLineStringNoLeadingWhitespace = (strings, ...values) => {
        let output = '';
        for (let i = 0; i < values.length; i++) {
          output += strings[i] + values[i];
        }
        output += strings[values.length];

        // Split on newlines.
        let lines = output.split(/(?:\r\n|\n|\r)/);

        // Rip out the leading whitespace.
        lines = lines.map((line) => {
          return `${line.replace(/^\s+/gm, '')}\n`;
        });

        return lines.join('').trim();
    }

    /**
     * Returns index of position of a string if it exists as a
     * substring in any of the elements in the array.
     * @param {string} s string to search for
     * @param {string[]} arr array of string
     */
    static isSubstringOfElement(s, arr) {
        for (let i = 0; i < arr.length; i++) {
            if (arr[i] && arr[i].indexOf(s) >= 0) {
                return i;
            }
        }
        return -1;
    }

    /**
     * Returns the value of the key=value pair.
     * @param {string} search parameter to search for
     * @param {array} params array of parameters to search through
     * @param {string} defaultParam default return value if search does not exist
     */
    static getParamValue(search, params, defaultParam) {
        let index = this.isSubstringOfElement(search, params);
        if (index >= 0) {
            return params[index].slice(params[index].indexOf('=') + 1).toLowerCase();
        } else {
            return defaultParam;
        }
    }

    /**
     * Attempts to get an .env value.
     * @param {string} varName in an .env file
     * @returns value if exists, errors out otherwise.
     */
    static getEnvironmentVariable(varName) {
        if (process.env[varName]) {
            return process.env[varName];
        } else {
            process.exit(-1);
        }
    }

    /**
     * Returns an array with arrays of the given size.
     *
     * @param myArray {Array} Array to split
     * @param chunkSize {Integer} Size of every group
     */
    static chunkArray(myArray, chunk_size) {
        let results = [];

        while (myArray.length) {
            results.push(myArray.splice(0, chunk_size));
        }

        return results;
    }

    //////////////////////////////
    // Strings and Math
    //////////////////////////////

    /**
     * Sees if a string is inside of another string
     * @param {string} str
     * @param {string} searchStr
     * @param {boolean} ignoreCase
     */
    static stringContains(str, searchStr, ignoreCase = false) {
        if (ignoreCase) {
            return str.toLowerCase().indexOf(searchStr.toLowerCase()) >= 0;
        }
        return str.indexOf(searchStr) >= 0;
    }

    /**
     * Given a fraction it will return the equivalent % with '%' tacked on
     * @param {number} num
     * @param {number} den
     * @param {number} precision
     */
    static getPercentFromFraction(num, den, precision = 2) {
        if (num === 0 || den === 0) return '0%';
        return this.round((num/den)*100, precision) + '%';
        //Math.round((num/den)*100 * 100) / 100 + '%';
    }

    /**
     * Given a number it will round it to the nearest 100th place by default
     * @param {number} num
     * @param {number} precision
     */
    static round(num, precision = 2) {
        const castedNum = Number(num);

        if (isNaN(castedNum)) { return ''; }

        //return Math.round(num * 100) / 100;
        return num.toFixed(precision);
    }
}