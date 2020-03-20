const users = require("../models/users.model");
const error = require("../middleware/error.middleware");
const hash = require("crypto-js");

exports.add = async function(req, res) 
{
    try {
        let body = req.body;
        console.log("User request add", body);

        if (body.name == null || body.name.length < 1) {
            throw new error.BadRequest("No name was included");
        }
        if (body.email == null || !body.email.includes('@')) {
            throw new error.BadRequest("Email not valid");
        }
        if (body.password == null || body.password.length < 1) {
            throw new error.BadRequest("Password is empty");
        } //else {
        //    body.password = hash.SHA256(body.password);
        //}

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
        const user = await users.get(body.email, "email", ["userId", "password"]);
        if (user == null || body.password !== user.password) {
            throw new error.BadRequest("Password or email is incorrect");
        }

        const token = String(hash.MD5(String(Math.random())));
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

        const user = await users.getAuth(token, ["userId"]);

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

        const user = await users.get(id, "userId", ["name", "city", "country", "email", "token"]);
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

        const user = await users.getAuth(token, ["userId", "password"]);
        if (user.userId != id) { //as the returned id is a string
            throw new error.Forbidden("Request tried to edit non-self user");
        }

        if (body == null || Object.keys(body).length === 0) {
            throw new error.BadRequest("No update data was provided");
        }
        if (body.email != null && !body.email.includes('@')) {
            throw new error.BadRequest("Email is not valid");
        }
        if (body.password != null) {
            if (body.password.length < 1) {
                throw new error.BadRequest("New password is not valid");
            }
            if (body.currentPassword == null || body.currentPassword !== user.password) {
                throw new error.BadRequest("Current password is incorrect");
            }
            delete body.currentPassword;
        }

        await users.update(id, body);
        res.status(200).send();
        console.log("Responded");
    } catch (err) {
        error.catch(err, res);
    }
}