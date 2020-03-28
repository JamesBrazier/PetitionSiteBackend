/**
 * @description the error class for http 400 error
 * @extends Error
 */
exports.BadRequest = class BadRequest extends Error {
    /**
     * @param {String} message 
     */
    constructor(message) {
        super(message);
        this.name = "BadRequest";
        this.httpCode = 400;
    }
}

/**
 * @description the error class for http 401 error
 * @extends Error
 */
exports.Unauthorized = class Unauthorized extends Error {
    /**
     * @param {String} message
     */
    constructor(message) {
        super(message);
        this.name = "Unauthorized";
        this.httpCode = 401
    }
}

/**
 * @description the error class for http 403 error
 * @extends Error
 */
exports.Forbidden = class Forbidden extends Error {
    /**
     * @param {String} message
     */
    constructor(message) {
        super(message);
        this.name = "Forbidden";
        this.httpCode = 403;
    }
}

/**
 * @description the error class for http 404 error
 * @extends Error
 */
exports.NotFound = class NotFound extends Error {
    /**
     * 
     * @param {String} message 
     */
    constructor(message) {
        super(message);
        this.name = "NotFound";
        this.httpCode = 404;
    }
}

/**
 * @description the error class for http 500 error
 * @extends Error
 */
exports.InternalError = class InternalError extends Error {
    /**
     * @param {String} message 
     */
    constructor(message) {
        super(message);
        this.name = "InternalError";
        this.httpCode = 500;
    }
}

/**
 * @param {Error} err the error to handle
 * @param {Response} res the html response to use to reply
 */
exports.catch = function(err, res) 
{
    let code = err.httpCode;
    if (code == null) { //if there is no http code, aka not one of my errors, use 500 (internal error)
        code = 500;
    }
    console.log(`ERROR! ${code}:`, err.message);
    res.status(code).send();
}