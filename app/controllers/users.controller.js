const users = require("../models/users.model");
const error = require("../middleware/error.middleware");
const parse = require("../middleware/parse.middleware");
const hash = require("crypto-js");

/**
 * @description adds a new user to the database
 * @param {Request} req the client's request
 * @param {Response} res the server's response to send
 */
exports.add = async function(req, res) 
{
    try {
        let body = parse.body(req.body); //the details about the user
        console.log("User request add", body);

        if (body.name == null || body.name == 0) { //ensure the name is defined and non-empty
            throw new error.BadRequest("No name was included");
        }
        if (body.email == null || !body.email.includes('@')) { //ensure the email is valid
            throw new error.BadRequest("Email not valid");
        }
        if (await users.get(body.email, "email", ["email"]) != null) { //ensure the email is unique
            throw new error.BadRequest("a user already uses the given email");
        }
        if (body.password == null || body.password == 0) { //ensure the password is valid
            throw new error.BadRequest("Password is empty");
        } //else {
        //    body.password = hash.SHA256(body.password);
        //}

        const info = await users.add(body);

        res.status(201).send({ userId: info.insertId }); //return the new user's id
        console.log("Responded with", info.insertId);
    } catch (err) {
        error.catch(err, res);
    }
}

/**
 * @description logs in the user, sending a session token
 * @param {Request} req the client's request
 * @param {Response} res the server's response to send
 */
exports.login = async function(req, res) 
{
    try {
        let body = parse.body(req.body);
        console.log("User request login", body);

        const user = await users.get(body.email, "email", ["userId", "password"]);
        if (user == null || body.password !== user.password) { //if the user doesnt exsist or the password is wrong/invalid
            throw new error.BadRequest("Password or email is incorrect");
        }

        const token = String(hash.MD5(String(Math.random()))); //generate a random hex token (hash only works for strings)
        await users.update(user.userId, { token: token });

        user.token = token;
        delete user.password;
        res.status(200).send(user);
        console.log("Responded with", user);
    } catch (err) {
        error.catch(err, res);
    }
}

/**
 * @description logs the authorized user out, removing the token
 * @param {Request} req the client's request
 * @param {Response} res the server's response to send
 */
exports.logout = async function(req, res) 
{
    try {
        const token = parse.token(req.get("X-Authorization")); //ensure the token is valid
        console.log("User request logout", token);

        const user = await users.getAuth(token, ["userId"]); //get the token with the token

        await users.clearFields(user.userId, ["token"]); //remove the token (set to NULL in db)

        res.status(200).send();
        console.log("Responded");
    } catch (err) {
        error.catch(err, res);
    }
}

/**
 * @description sends details about the user,
 * the email is only returned if the client is the user
 * @param {Request} req the client's request
 * @param {Response} res the server's response to send
 */
exports.get = async function(req, res) 
{
    try {
        const id = parse.number(req.params.id); //ensure the id is a valid number
        const token = req.get("X-Authorization"); //we don't check this here because its not required
        console.log(`User request view ${id} with ${token}`)

        const user = await users.get(id, "userId", 
            ["name", "city", "country", "email", "token"]
        );
        if (user == null) {
            throw new error.NotFound("no user with given id found");
        }

        if (token == null || user.token !== token) { //remove the email if the client is not logged in as the user
            delete user.email;
        }

        delete user.token; //we don't want to send the token back too
        res.status(200).send(user);
        console.log("Responded with", user);
    } catch (err) {
        error.catch(err, res);
    }
}

/**
 * @description updates the authorized user with the given details
 * users can only update themselves
 * @param {Request} req the client's request
 * @param {Response} res the server's response to send
 */
exports.update = async function(req, res)
{
    try {
        const body = parse.body(req.body); //the updated values
        const id = parse.number(req.params.id);
        const token = parse.token(req.get("X-Authorization"));
        console.log(`User request update ${id} with`, body, "and", token);

        const user = await users.getAuth(token, ["userId", "password"]);
        if (user.userId !== id) {
            throw new error.Forbidden("Request tried to edit non-self user");
        }

        if (body.email != null && !body.email.includes('@')) {
            throw new error.BadRequest("Email is not valid");
        }
        if (body.password != null) { // if the password field is defined
            if (body.password == 0) {
                throw new error.BadRequest("New password is not valid");
            }
            if (body.currentPassword == null || body.currentPassword !== user.password) {
                throw new error.BadRequest("Current password is incorrect");
            }
            delete body.currentPassword; //not a valid field for the update
        }

        await users.update(id, body);
        res.status(200).send();
        console.log("Responded");
    } catch (err) {
        error.catch(err, res);
    }
}