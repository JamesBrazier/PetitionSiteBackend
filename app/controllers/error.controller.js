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

exports.catch = function(err, res) 
{
    console.error(err);
    switch (err.name) {
    case "BadRequest":
        res.status(400).send(); break;
    case "Unauthorized":
        res.status(401).send(); break;
    case "Forbidden":
        res.status(403).send(); break;
    case "NotFound":
        res.status(404).send(); break;
    case "InternalError":
    default:
        res.status(500).send(); break;
    }
}