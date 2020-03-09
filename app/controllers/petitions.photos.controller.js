const petitions = require("../models/petitions.model");

exports.get = async function(req, res)
{
    try {

    } catch (err) {
        res.status(500).send(`Error viewing a petition's hero image: ${err}`);
    }
}

exports.set = async function(req, res)
{
    try {

    } catch (err) {
        res.status(500).send(`Error setting a petition's hero image: ${err}`);
    }
}