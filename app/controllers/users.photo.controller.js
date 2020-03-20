const users = require("../models/users.model");
const error = require("../middleware/error.middleware");
const file = require("../middleware/file.middleware");

exports.get = async function(req, res) 
{
    try {
        const id = req.params.id;
        console.log("Users.photo request view", id);

        const user = await users.get(id, "userId", ["photoFilename"]);

        if (user == null) {
            throw new error.NotFound("User with id not found");
        }

        const image = await file.loadPhoto(user.photoFilename);

        res.status(200).contentType(image.type).send(image.data);
        console.log("Responeded with", user.photoFilename);
    } catch (err) {
        error.catch(err, res);
    }
}

exports.set = async function(req, res) 
{
    try {
        const id = req.params.id;
        const token = req.get("X-Authorization");
        let content = req.get("Content-Type");
        const image = req.body;
        console.log("Users.photos request update", id, "with", token);

        if (!["image/png", "image/jpeg", "image/gif"].includes(content)) {
            throw new error.BadRequest("given content type is not supported");
        }
        content = content.slice(6); //get the file extention;

        const user = await users.getAuth(token, ["userId", "photoFilename"]);
        if (user.userId != id) {
            throw new error.Forbidden("client tried to edit non-self user");
        }

        const filename = "user_" + user.userId + '.' + content;
        if (await file.savePhoto(image, filename)) {
            res.status(200).send();
        } else {
            await users.update(id, {photoFilename: filename});
            res.status(201).send();
        }
        console.log("Responed");
    } catch (err) {
        error.catch(err, res);
    }
}

exports.delete = async function(req, res) 
{
    try {
        const id = req.params.id;
        const token = req.get("X-Authorization");
        console.log("Users.photos request delete", id, "with", token);

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