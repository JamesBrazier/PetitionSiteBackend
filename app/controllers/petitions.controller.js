const petitions = require("../models/petitions.model");
const categories = require("../models/categories.model");

exports.view = async function(req, res) 
{
    try {
        


    } catch (err) {
        res.status(500).send(`Error viewing a petition: ${err}`);
    }
}

exports.viewAll = async function(req, res) 
{
    try {

    } catch (err) {
        res.status(500).send(`Error viewing all petitions: ${err}`);
    }
}

exports.add = async function(req, res) 
{
    try {

    } catch (err) {
        res.status(500).send(`Error adding a petition: ${err}`);
    }
}

exports.update = async function(req, res) 
{
    try {

    } catch (err) {
        res.status(500).send(`Error editing a petition: ${err}`);
    }
}

exports.delete = async function(req, res) 
{
    try {

    } catch (err) {
        res.status(500).send(`Error deleting a petition: ${err}`);
    }
}

exports.categories = async function(req, res) 
{
    try {

    } catch (err) {
        res.status(500).send(`Error viewing petition categories: ${err}`);
    }
}
