const users = require("../models/users.model");
const error = require("./error.controller");
const hash = require("object-hash");

exports.add = async function(req, res) 
{
    try {
        let body = req.body;
        console.log("User request add", body);

        if (body.email == null || !body.email.includes('@')) {
            throw new error.BadRequest("Email not valid");
        }
        if (body.password == null || body.password.length < 1) {
            throw new error.BadRequest("Password is empty");
        } else {
            body.password = hash.sha1(body.password);
        }

        const info = await users.add(body);

        res.status(201).send({ userId: info.insertId });
        console.log("Responded with", info.insertId);
    } catch (err) {
        error.catch(err, res);
    }
}

exports.login = async function(req, res) 
{
    try {
        let body = req.body;
        console.log("User request login", body);

        if (body.password == null) {
            throw new error.BadRequest("Password is not valid")
        }
        const user = await users.getFromEmail(body.email, ["userId", "password"]);
        if (hash.sha1(body.password) !== user.password) {
            throw new error.BadRequest("Password is incorrect");
        }

        //const token = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
        const token = 1337;
        await users.update(user.userId, { token: token });

        user.token = token;
        delete user.password;
        res.status(200).send(user);
        console.log("Responded with", user);
    } catch (err) {
        error.catch(err, res);
    }
}

exports.logout = async function(req, res) 
{
    try {
        const token = req.get("X-Authorization");
        console.log("User request logout", token);

        const user = await users.getFromToken(token);
        if (user == null) {
            throw new error.Unauthorized("Request is not from an authorised user");
        }

        await users.clearFields(user.userId, ["token"]);

        res.status(200).send();
        console.log("Responded");
    } catch (err) {
        error.catch(err, res);
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
            throw new error.NotFound("user with id not found");
        }

        if (token == null || user.token !== token) {
            delete user.email;
        }

        delete user.token;
        res.status(200).send(user);
        console.log("Responded with", user);
    } catch (err) {
        error.catch(err, res);
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
            throw new error.Unauthorized("Request is not from an authorised user");
        }

        const user = await users.get(id, ["token", "password"]);
        if (user.token !== token) {
            throw new error.Forbidden("Request tried to edit non-self user");
        }

        if (body.email != null && !body.email.includes('@')) {
            throw new error.BadRequest("Email is not valid");
        }
        if (body.password != null) {
            if (body.password.length < 1) {
                throw new error.BadRequest("New password is not valid");
            }
            if (body.currentPassword == null || hash.sha1(body.currentPassword) !== user.password) {
                throw new error.BadRequest("Current password is incorrect");
            }
            body.password = hash.sha1(body.password);
            delete body.currentPassword;
        }

        await users.update(id, body);
        res.status(200).send();
        console.log("Responded");
    } catch (err) {
        error.catch(err, res);
    }
}