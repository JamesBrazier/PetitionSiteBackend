const users = require("../models/users.model");
const hash = require("object-hash");

exports.add = async function(req, res) 
{
    try {
        
    } catch (err) {
        res.status(500).send(`Error registering a user: ${err}`);
    }
}

exports.login = async function(req, res) 
{
    try {

    } catch (err) {
        res.status(500).send(`Error logging in a user: ${err}`);
    }
}

exports.logout = async function(req, res) 
{
    try {

    } catch (err) {
        res.status(500).send(`Error logging out a user: ${err}`);
    }
}

exports.get = async function(req, res) 
{
    try {

    } catch (err) {
        res.status(500).send(`Error viewing a user: ${err}`);
    }
}

exports.update = async function(req, res)
{
    try {

    } catch (err) {
        res.status(500).send(`Error updating a user: ${err}`);
    }
}