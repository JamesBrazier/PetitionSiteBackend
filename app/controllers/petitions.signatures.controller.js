const petitions = require("../models/petitions.model");
const signatures = require("../models/signatures.model");
const users = require("../models/users.model");
const error = require("../middleware/error.middleware");
const parse = require("../middleware/parse.middleware");

exports.get = async function(req, res)
{
    try {
        const id = parse.number(req.params.id);
        console.log("Petitions.signatures request view", id);

        if (!await petitions.exists(id)) {
            throw new error.NotFound("no petition with id found");
        }

        const signature = await signatures.get(id, "petitionId", 
            ["signatoryId", "name", "city", "country", "signedDate"]
        );

        res.status(200).send(signature);
        console.log("Responded with", signature);
    } catch (err) {
        error.catch(err, res);
    }
}

exports.add = async function(req, res)
{
    try {
        const id = parse.number(req.params.id);
        const token = parse.token(req.get("X-Authorization"));
        console.log("Petitions.signatures request add", id, "with", token);

        const user = await users.getAuth(token, ["userId"]);
        const petition = await petitions.get(id, "petitionId", ["closingDate"]);
        if (petition == null) {
            throw new error.NotFound("no petition with id found");
        }

        const currentDate = new Date();
        if (new Date(petition.closingDate) <= currentDate) {
            throw new error.Forbidden("the petition has closed");
        }
        if (await signatures.exists(id, user.userId)) {
            throw new error.Forbidden("user has already signed the petition");
        }

        await signatures.add(id, user.userId, currentDate);

        res.status(200).send();
        console.log("Responded");
    } catch (err) {
        error.catch(err, res);
    }
}

exports.delete = async function(req, res)
{
    try {
        const id = parse.number(req.params.id);
        const token = parse.token(req.get("X-Authorization"));
        console.log("Petitions.signatures request delete", id, "with", token);

        const user = await users.getAuth(token, ["userId"]);
        const petition = await petitions.get(id, "petitionId", ["closingDate", "authorId"]);
        if (petition == null) {
            throw new error.NotFound("no petition with id found");
        }

        if (new Date(petition.closingDate) <= new Date()) {
            throw new error.Forbidden("the petition has closed");
        }
        if (petition.authorId === user.userId) {
            throw new error.Forbidden("user cannot remove their signature from own petition");
        }
        if (!await signatures.exists(id, user.userId)) {
            throw new error.Forbidden("user hasn't signed the petition");
        }

        await signatures.delete(id, user.userId);

        res.status(200).send();
        console.log("Responded")
    } catch (err) {
        error.catch(err, res);
    }
}