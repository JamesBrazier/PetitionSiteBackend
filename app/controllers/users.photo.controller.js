const users = require("../models/users.model");
const error = require("../middleware/error.middleware");
const file = require("../middleware/file.middleware");
const parse = require("../middleware/parse.middleware");

/**
 * @description sends the user's profile image
 * @param {Request} req the client's request
 * @param {Response} res the server's response to send
 */
exports.get = async function(req, res) 
{
    try {
        const id = parse.number(req.params.id); //ensure the id is a valid number
        console.log("Users.photo request view", id);

        const user = await users.get(id, "userId", ["photoFilename"]);
        if (user == null) {
            throw new error.NotFound("no user with given id found");
        }

        const image = await file.loadPhoto(user.photoFilename);

        res.status(200).contentType(image.type).send(image.data); //send the image with the content type
        console.log("Responded with", user.photoFilename);
    } catch (err) {
        error.catch(err, res);
    }
}

/**
 * @description sets the users profile image,
 * users can only set their own profile's image
 * @param {Request} req the client's request
 * @param {Response} res the server's response to send
 */
exports.set = async function(req, res) 
{
    try {
        const id = parse.number(req.params.id);
        const token = parse.token(req.get("X-Authorization")); //ensure the token is valid
        const fileType = parse.MIME(req.get("Content-Type")); //check if image type is supported
        console.log("Users.photos request update", id, "with", token);

        if (!await users.exists(id)) {
            throw new error.NotFound("no user with given id found");
        }

        const user = await users.getAuth(token, ["userId", "photoFilename"]); //get user with token
        if (user.userId != id) {
            throw new error.Forbidden("client tried to edit non-self user");
        }

        const filename = "user_" + user.userId + fileType;
        await file.savePhoto(req.body, filename); //save the new file

        let status;
        if (user.photoFilename != null) {
            if (user.photoFilename != filename) { //delete the old file if its not overidden
                await file.deletePhoto(user.photoFilename);
            }
            status = 200;
        } else {
            status = 201;
        }

        await users.update(id, { "photoFilename": filename }); //change the recorded name
        res.status(status).send();
        console.log("Responed");
    } catch (err) {
        error.catch(err, res);
    }
}

/**
 * @description removes the users profile image,
 * users can only remove their own image
 * @param {Request} req the client's request
 * @param {Response} res the server's response to send
 */
exports.delete = async function(req, res) 
{
    try {
        const id = parse.number(req.params.id);
        const token = parse.token(req.get("X-Authorization"));
        console.log("Users.photos request delete", id, "with", token);

        if (!await users.exists(id)) {
            throw new error.NotFound("no user with given id found");
        }

        const user = await users.getAuth(token, ["userId", "photoFilename"]);
        if (user.userId != id) {
            throw new error.Forbidden("client tried to edit non-self user");
        }

        await file.deletePhoto(user.photoFilename);
        await users.clearFields(id, ["photoFilename"]); //remove the filename from the user
        res.status(200).send();
        console.log("Responded")
    } catch (err) {
        error.catch(err, res);
    }
}