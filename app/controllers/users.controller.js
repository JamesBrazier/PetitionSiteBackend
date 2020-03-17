const users = require("../models/users.model");
const error = require("./error.controller");
const hash = require("object-hash");

exports.add = async function(req, res) 
{
    try {
        let body = req.body;
        console.log("User request add", body);

        if (body.email == null || !body.email.includes('@')) {
            throw error.BadRequest("Email not valid");
        }
        if (body.password == null || body.email.password.length < 1) {
            throw error.BadRequest("Password is empty");
        } else {
            body.password = hash.sha1(body.password);
        }

        const info = await users.add(body);

        res.status(201).send({ userId: info.insertedId });
        console.log("Responded with", info.insertedId);
    } catch (err) {
        console.error(err);
        switch (err.name) {
        case "BadRequest":
            res.status(400).send(); break;
        case "InternalError":
        default:
            res.status(500).send(); break;
        }
    }
}

exports.login = async function(req, res) 
{
    try {
        let body = req.body;
        console.log("User request login", body);

        if (body.password == null) {
            throw error.BadRequest("Password is not valid")
        }
        const user = await users.getFromEmail(body.email, ["userId", "password"]);
        if (hash.sha1(body.password) !== user.password) {
            throw error.BadRequest("Password is incorrect");
        }

        const token = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
        await users.update(user.userId, { token: token });

        user.token = token;
        delete user.password;
        res.status(200).send(user);
        console.log("Responded with", user);
    } catch (err) {
        console.error(err);
        switch (err.name) {
        case "BadRequest":
            res.status(400).send(); break;
        case "InternalError":
        default:
            res.status(500).send(); break;
        }
    }
}

exports.logout = async function(req, res) 
{
    try {
        const token = req.get("X-Authorization");
        console.log("User request logout", token);

        const user = await users.getFromToken(token);
        if (user == null) {
            throw error.Unauthorized("Request is not from an authorised user");
        }

        await users.update(user.id, { token: null });

        res.status(200).send();
        console.log("Responded");
    } catch (err) {
        console.error(err);
        switch (err.name) {
        case "BadRequest":
            res.status(400).send(); break;
        case "Unauthorized":
            res.status(401).send(); break;
        case "InternalError":
        default:
            res.status(500).send(); break;
        }
    }
}

exports.get = async function(req, res) 
{
    try {
        const id = req.params.id;
        const token = req.get("X-Authorization");
        console.log(`User request view ${id} with ${token}`)

        const user = await users.get(id, ["name", "city", "country", "email", "token"]);
        if (user == null) {
            throw error.NotFound("user with id not found");
        }

        if (token != null || user.token !== token) {
            delete user.email;
        }

        delete user.token;
        res.status(200).send(user);
        console.log("Responded with", user);
    } catch (err) {
        console.error(err);
        switch (err.name) {
        case "NotFound":
            res.status(404).send(); break;
        case "InternalError":
        default:
            res.status(500).send(); break;
        }
    }
}

exports.update = async function(req, res)
{
    try {
        const body = req.body;
        const id = req.params.id;
        const token = req.get("X-Authorization");
        console.log(`User request update ${id} with`, body, "and", token);

        if (token == null) {
            throw error.Unauthorized("Request is not from an authorised user");
        }

        const user = await users.get(id, ["token", "password"]);
        if (user.token !== token) {
            throw error.Forbidden("Request tried to edit non-self user");
        }

        if (body.email != null && !body.email.includes('@')) {
            throw error.BadRequest("Email is not valid");
        }
        if (body.password != null) {
            if (body.password.length < 1) {
                throw error.BadRequest("New password is not valid");
            }
            if (body.currentPassword == null || hash.sha1(currentPassword) !== user.password) {
                throw error.BadRequest("Current password is incorrect");
            }
            body.password = hash.sha1(body.password);
            delete body.currentPassword;
        }

        await users.update(id, body);
        res.status(200).send();
        console.log("Responded");
    } catch (err) {
        console.error(err);
        switch (err.name) {
        case "BadRequest":
            res.status(400).send(); break;
        case "Unauthorized":
            res.status(401).send(); break;
        case "Forbidden":
            res.status(403).send(); break;
        case "InternalError":
        default:
            res.status(500).send(); break;
        }
    }
}