const petitions = require("../models/petitions.model");
const users = require("../models/users.model");
const error = require("../middleware/error.middleware");
const parse = require("../middleware/parse.middleware");
const file = require("../middleware/file.middleware");

exports.get = async function(req, res)
{
    try {
        const id = parse.number(req.params.id);
        console.log("Petition.photo request view", id);

        const petition = await petitions.get(id, "petitionId", ["photoFilename"]);
        if (petition == null) {
            throw new error.NotFound("no petition with id found");
        }

        const image = await file.loadPhoto(petition.photoFilename);

        res.status(200).contentType(image.type).send(image.data);
        console.log("Responded with", petition.photoFilename);
    } catch (err) {
        error.catch(err, res);
    }
}

exports.set = async function(req, res)
{
    try {
        const id = parse.number(req.params.id);
        const token = parse.token(req.get("X-Authorization"));
        console.log("Petition.photo request update", id, "with", token);

        const user = await users.getAuth(token, ["userId"]);
        const petition = await petitions.get(id, "petitionId", ["authorId", "photoFilename"]);
        if (petition == null) {
            throw new error.NotFound("no petition with id found");
        }

        if (petition.authorId !== user.userId) {
            throw new error.Forbidden("client tried to edit nsomeone else's petition");
        }

        const filename = await file.saveBodyPhoto(req, "petition_" + id);
        let status;
        if (petition.photoFilename != null) {
            await file.deletePhoto(petition.photoFilename); //delete the old file
            status = 200;
        } else {
            status = 201;
        }

        await petitions.update(id, { "photoFilename": filename });
        res.status(status).send();
        console.log("Responded");
    } catch (err) {
        error.catch(err, res);
    }
}