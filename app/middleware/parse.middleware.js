const error = require("./error.middleware");

exports.number = function(num)
{
    num = Number(num);

    if (num === NaN) {
        throw new error.BadRequest("number argument not valid");
    }

    return num;
}

exports.token = function(token)
{
    if (token == null || token == 0) {
        throw new error.Unauthorized("no token was defined");
    }

    return token;
}