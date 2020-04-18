const crypto = require("crypto-js");

/**
 * @description returns a hashed version of the value using SHA256
 * @param value the value to hash
 * @returns {String} the result of the hash
 */
exports.hash = function(value)
{
    if (value instanceof String) { //hash only works for strings
        return String(crypto.SHA256(value));
    } else {
        return String(crypto.SHA256(String(value)));
    }
}

/**
 * @description returns whether a value hashed matches the given hash
 * @param value the value to compare
 * @param {String} hash the hash to compare to
 * @returns {Boolean} true if the hashes match
 */
exports.equals = function(value, hash)
{
    return exports.hash(value) === hash;
}

/**
 * @description generates a random 32 character long token string
 * @returns {String} a 32 char long token
 */
exports.genToken = function()
{
    return String(crypto.MD5(String(Math.random()))); //generate a random hex token
}