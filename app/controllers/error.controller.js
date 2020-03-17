exports.BadRequest = class BadRequest extends Error {
    /**
     * 
     * @param {String} message 
     */
    constructor(message) {
        super(message);
        this.name = "BadRequest";
    }
}

exports.Unauthorized = class Unauthorized extends Error {
    /**
     * @param {String} message
     */
    constructor(message) {
        super(message);
        this.name = "Unauthorized";
    }
}

exports.Forbidden = class Forbidden extends Error {
    /**
     * @param {String} message
     */
    constructor(message) {
        super(message);
        this.name = "Forbidden";
    }
}

exports.NotFound = class NotFound extends Error {
    /**
     * 
     * @param {String} message 
     */
    constructor(message) {
        super(message);
        this.name = "NotFound";
    }
}

exports.InternalError = class InternalError extends Error {
    /**
     * 
     * @param {String} message 
     */
    constructor(message) {
        super(message);
        this.name = "InternalError";
    }
}