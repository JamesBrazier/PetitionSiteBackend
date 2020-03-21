const users = require("../models/users.model");
const error = require("../middleware/error.middleware");
const file = require("../middleware/file.middleware");
const parse = require("../middleware/parse.middleware");

exports.get = async function(req, res) 
{
    try {
        const id = parse.number(req.params.id);
        console.log("Users.photo request view", id);

        const user = await users.get(id, "userId", ["photoFilename"]);
        if (user == null) {
            throw new error.NotFound("no user with given id found");
        }

        const image = await file.loadPhoto(user.photoFilename);

        res.status(200).contentType(image.type).send(image.data);
        console.log("Responded with", user.photoFilename);
    } catch (err) {
        error.catch(err, res);
    }
}

exports.set = async function(req, res) 
{
    try {
        const id = parse.number(req.params.id);
        const token = parse.token(req.get("X-Authorization"));
        console.log("Users.photos request update", id, "with", token);

        if (!await users.exists(id)) {
            throw new error.NotFound("no user with given id found");
        }

        const user = await users.getAuth(token, ["userId", "photoFilename"]);
        if (user.userId != id) {
            throw new error.Forbidden("client tried to edit non-self user");
        }

        const filename = await file.saveBody(req, "user_" + user.userId)
        let status;
        if (user.photoFilename != null) {
            await file.deletePhoto(user.photoFilename); //delete the old file
            status = 200;
        } else {
            status = 201;
        }

        await users.update(id, { "photoFilename": filename });
        res.status(status).send();
        console.log("Responed");
    } catch (err) {
        error.catch(err, res);
    }
}

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
        await users.clearFields(id, ["photoFilename"]);
        res.status(200).send();
        console.log("Responded")
    } catch (err) {
        error.catch(err, res);
    }
}