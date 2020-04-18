const petitions = require("../models/petitions.model");
const users = require("../models/users.model");
const error = require("../middleware/error.middleware");
const parse = require("../middleware/parse.middleware");
const file = require("../middleware/file.middleware");

/**
 * @description sends the photo of the given petition
 * @param {Request} req the client's request
 * @param {Response} res the server's response to send
 */
exports.get = async function(req, res)
{
    try {
        const id = parse.number(req.params.id); //ensure the id is valid
        console.log("Petition.photo request view", id);

        const petition = await petitions.get(id, "petitionId", ["photoFilename"]); //get the given fields from the petition with id
        if (petition == null) { //if the petition is null or undefined there is no petition with the id
            throw new error.NotFound("no petition with id found");
        }

        const image = await file.loadPhoto(petition.photoFilename); //load the file with the retrieved name

        res.status(200).contentType(image.type).send(image.data); //return the content type and the image
        console.log("Responded with", petition.photoFilename);
    } catch (err) {
        error.catch(err, res);
    }
}

/**
 * @description sets the photo for the given petition,
 * only the author can set the photo for their petition
 * @param {Request} req the client's request
 * @param {Response} res the server's response to send
 */
exports.set = async function(req, res)
{
    try {
        const id = parse.number(req.params.id);
        const token = parse.token(req.get("X-Authorization")); //ensure the token is valid
        const fileType = parse.MIME(req.get("Content-Type")); //check if image type is supported
        console.log("Petition.photo request update", id, "with", token);

        const user = await users.getAuth(token, ["userId"]); //get the user with the token
        const petition = await petitions.get(id, "petitionId", ["authorId", "photoFilename"]);
        if (petition == null) {
            throw new error.NotFound("no petition with id found");
        }

        if (petition.authorId !== user.userId) {
            throw new error.Forbidden("client tried to edit nsomeone else's petition");
        }

        const filename = "petition_" + id + fileType;
        await file.savePhoto(req.body, filename); //save the body of the request

        let status;
        if (petition.photoFilename != null) {
            if (petition.photoFilename != filename) { //delete the old file if it wasn't overidden
                await file.deletePhoto(petition.photoFilename);
            }
            status = 200;
        } else {
            status = 201;
        }

        await petitions.update(id, { "photoFilename": filename }); //change the recorded name
        res.status(status).send();
        console.log("Responded");
    } catch (err) {
        error.catch(err, res);
    }
}