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
    switch (err.name) {
    case "BadRequest":
        res.status(400).send(); 
        console.error("ERROR! 400:", err.message);
        break;
    case "Unauthorized":
        res.status(401).send(); 
        console.error("ERROR! 401:", err.message);
        break;
    case "Forbidden":
        res.status(403).send();
        console.error("ERROR! 403:", err.message);
        break;
    case "NotFound":
        res.status(404).send();
        console.error("ERROR! 404:", err.message);
        break;
    case "InternalError":
    default:
        console.log(err);
        res.status(500).send();
        break;
    }
}