const error = require("./error.middleware");

/**
 * @description returns the number after checking its validity
 */
exports.number = function(num)
{
    num = Number(num);

    if (num === NaN) {
        throw new error.BadRequest("number argument not valid");
    }

    return num;
}

/**
 * @description returns the token after checking its validity
 */
exports.token = function(token)
{
    if (token == null || token == 0) { //if the token is undefined or empty
        throw new error.Unauthorized("no token was defined");
    }

    return token;
}

/**
 * @description returns the body after checking its validity
 */
exports.body = function(body)
{
    if (body == null || Object.keys(body).length === 0) { //if the object is undefined or empty
        throw new error.BadRequest("No body data was provided");
    }

    return body;
}