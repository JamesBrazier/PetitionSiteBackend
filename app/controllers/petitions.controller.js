const petitions = require("../models/petitions.model");
const categories = require("../models/categories.model");
const users = require("../models/users.model");
const error = require("../middleware/error.middleware");
const parse = require("../middleware/parse.middleware");

/**
 * @description sends detailed information about one petition
 * @param {Request} req the client's request
 * @param {Response} res the server's response to send
 */
exports.view = async function(req, res) 
{
    try {
        const id = parse.number(req.params.id); //check if the id is a valid number
        console.log("Petition request view", id);

        //get the given fields from petition with id
        const petition = await petitions.get(id, "petitionId", [
            "petitionId", "title", "category", "authorName", 
            "signatureCount", "description", "authorId", "authorCity", 
            "authorCountry", "createdDate", "closingDate"
        ]);
        if (petition == null) { //if the petition is null or undefined there is not petition with id
            throw new error.NotFound("no petition with given id found");
        }

        res.status(200).send(petition);
        console.log("Responded with", petition);
    } catch (err) {
        error.catch(err, res);
    }
}

/**
 * @description sends a set of petitions that match the given query params
 * @param {Request} req the client's request
 * @param {Response} res the server's response to send
 */
exports.search = async function(req, res) 
{
    try {
        const query = req.query; //get all the url query params
        console.log("Petition request search with", query)

        //check for valid params
        if (query.startIndex != null) query.startIndex = parse.number(query.startIndex);
        if (query.count != null) query.count = parse.number(query.count);

        if (query.categoryId != null) {
            query.categoryId = parse.number(query.categoryId);
            if (!await categories.exists(query.categoryId)) {
                throw new error.BadRequest("invalid category id");
            }
        }
        if (query.authorId != null) {
            query.authorId = parse.number(query.authorId);
            if (!await users.exists(query.authorId)) {
                throw new error.BadRequest("no user with id found");
            }
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

/**
 * @description adds a new petition to the database with the given body,
 * only authorized users can add a petition
 * @param {Request} req the client's request
 * @param {Response} res the server's response to send
 */
exports.add = async function(req, res) 
{
    try {
        const data = parse.body(req.body); //check if the body is valid
        const token = parse.token(req.get("X-Authorization")); //check if the token is valid
        console.log("Petition request add", data, "with", token);

        if (data.title == null) {
            throw new error.BadRequest("no title was given");
        }

        const user = await users.getAuth(token, ["userId"]); //get the user with the given token
        data.authorId = user.userId; //add it to the body

        data.createdDate = new Date();
        if (data.closingDate != null && new Date(data.closingDate) <= data.createdDate) {
            throw new error.BadRequest("Closing date is not in the future");
        }
        if (!await categories.exists(data.categoryId)) {
            throw new error.BadRequest("category is invalid");
        }

        const newPet = await petitions.add(data);

        res.status(201).send({ petitionId: newPet.insertId }); //return the id
        console.log("Responded with", newPet.insertId);
    } catch (err) {
        error.catch(err, res);
    }
}

/**
 * @description changes the given attributes of a petition,
 * only the author can update their own petition
 * @param {Request} req the client's request
 * @param {Response} res the server's response to send
 */
exports.update = async function(req, res) 
{
    try {
        const id = parse.number(req.params.id);
        const token = parse.token(req.get("X-Authorization"));
        const data = parse.body(req.body); //get the changes from the body
        console.log(`Petition request update ${id} with`, data, "and", token);

        const user = await users.getAuth(token, ["userId"]);
        const petition = await petitions.get(id, "petitionId", ["authorId"]);
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
        if (data.categoryId != null && !await categories.exists(data.categoryId)) {
            throw new error.BadRequest("category is invalid");
        }

        await petitions.update(id, data);

        res.status(200).send();
        console.log("Responded")
    } catch (err) {
        error.catch(err, res);
    }
}

/**
 * @description deletes the petition with the given id,
 * only the author can delete their own petition
 * @param {Request} req the client's request
 * @param {Response} res the server's response to send
 */
exports.delete = async function(req, res) 
{
    try {
        const id = parse.number(req.params.id);
        const token = parse.token(req.get("X-Authorization"));
        console.log(`Petition resquest delete ${id} with ${token}`);

        const user = await users.getAuth(token, ["userId"]);
        const petition = await petitions.get(id, "petitionId", ["authorId"]);
        if (petition == null) {
            throw new error.NotFound("no petition with given id found");
        }

        if (petition.authorId !== user.userId) {
            throw new error.Forbidden("client tried to delete someone else's petition");
        }

        await petitions.delete(id);

        res.status(200).send();
        console.log("Responded");
    } catch (err) {
        error.catch(err, res);
    }
}

/**
 * @description sends the details of all the current categories
 * @param {Response} res the server's response to send
 */
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
