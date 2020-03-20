const petitions = require("../models/petitions.model");
const categories = require("../models/categories.model");
const users = require("../models/users.model");
const error = require("../middleware/error.middleware");

exports.view = async function(req, res) 
{
    try {
        const id = req.params.id;
        console.log("Petition request view", id);

        const petition = await petitions.get(id, "petitionId", [
            "petitionId", "title", "category", "authorName", 
            "signatureCount", "description", "authorId", "authorCity", 
            "authorCountry", "createdDate", "closingDate"
        ]);

        if (petition == null) {
            throw new error.NotFound("no petition with given id found");
        }

        res.status(200).send(petition);
        console.log("Responded with", petition);
    } catch (err) {
        error.catch(err, res);
    }
}

exports.search = async function(req, res) 
{
    try {
        const query = req.query;
        console.log("Petition request search with", query)

        if (query.startIndex != null) query.startIndex = Number(query.startIndex);
        if (query.count != null) query.count = Number(query.count);

        if (query.categoryId != null) {
            query.categoryId = Number(query.categoryId);
            await categories.get(query.categoryId);
        }
        if (query.authorId != null) {
            query.authorId = Number(query.authorId);
            await users.get(query.authorId);
        }

        const matched = await petitions.search(query, 
            ["petitionId", "title", "category", "authorName", "signatureCount"]
        );

        res.status(200).send(matched);
        console.log("Responded with", matched);
    } catch (err) {
        error.catch(err, res);
    }
}

exports.add = async function(req, res) 
{
    try {
        const data = req.body;
        const token = req.get("X-Authorization");
        console.log("Petition request add", data, "with", token);

        const user = await users.getAuth(token, ["userId"]);
        data.authorId = user.userId;

        data.createdDate = new Date();
        if (data.closingDate != null && new Date(data.closingDate) <= data.createdDate) {
            throw new error.BadRequest("Closing date is not in the future");
        }
        if (await categories.get(data.categoryId) == null) {
            throw new error.BadRequest("category is invalid");
        }

        const newPet = await petitions.add(data);

        res.status(201).send({ petitionId: newPet.insertId });
        console.log("Responded with", newPet.insertId);
    } catch (err) {
        error.catch(err, res);
    }
}

exports.update = async function(req, res) 
{
    try {
        const id = req.params.id;
        const token = req.get("X-Authorization");
        const data = req.body;
        console.log(`Petition request update ${id} with`, data, "and", token);

        const user = await users.getAuth(token, ["userId"]);
        const petition = await petitions.get(id, "petitionId", ["petitionId", "authorId"]);
        if (petition == null) {
            throw new error.NotFound("no petition with given id found");
        }

        if (petition.authorId !== user.userId) {
            throw new error.Forbidden("client tried to edit someone else's petition");
        }
        const currentDate = new Date();
        if (petition.closingDate <= currentDate) {
            throw new error.Forbidden("client is trying to edit expired petition");
        }

        if (data.closingDate != null && new Date(data.closingDate) <= currentDate) {
            throw new error.BadRequest("Closing date is not in the future");
        }
        if (data.categoryId != null && await categories.get(data.categoryId) == null) {
            throw new error.BadRequest("category is invalid");
        }

        await petitions.update(petition.petitionId, data);

        res.status(200).send();
        console.log("Responded")
    } catch (err) {
        error.catch(err, res);
    }
}

exports.delete = async function(req, res) 
{
    try {
        const id = req.params.id;
        const token = req.get("X-Authorization");
        console.log(`Petition resquest delete ${id} with ${token}`);

        const user = await users.getAuth(token, ["userId"]);
        const petition = await petitions.get(id, "petitionId", ["petitionId", "authorId"]);
        if (petition == null) {
            throw new error.NotFound("no petition with given id found");
        }

        if (petition.authorId !== user.userId) {
            throw new error.Forbidden("client tried to delete someone else's petition");
        }

        await petitions.delete(petition.petitionId);

        res.status(200).send();
        console.log("Responded");
    } catch (err) {
        error.catch(err, res);
    }
}

exports.viewCategories = async function(_, res) 
{
    try {
        console.log("Petition request view categories");

        const category = await categories.getAll();

        res.status(200).send(category);
        console.log("Responded with", category);
    } catch (err) {
        error.catch(err, res);
    }
}
