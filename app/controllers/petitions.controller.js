const petitions = require("../models/petitions.model");
const categories = require("../models/categories.model");
const users = require("../models/users.model");

exports.view = async function(req, res) 
{
    try {
        const id = req.params.id;

        console.log(`Petition request for id ${id}`);

        const petition = await petitions.get(req.params.id);

        if (petition === undefined) {
            res.status(404).send();
        } else {
            const user = await users.get(petition.author_id);

            const response = {
                petitionId: petition.petition_id,
                title: petition.title,
                category: (await categories.get(petition.category_id)).name,
                authorName: user.name,
                signatureCount: petition.signatures,
                description: petition.description,
                authorId: petition.author_id,
                authorCity: user.city,
                authorCountry: user.country,
                createdDate: petition.created_date,
                closingDate: petition.closing_date
            };

            console.log("Responded with", response);
            res.status(200).send(response);
        }
    } catch (err) {
        console.error(err)
        res.status(500).send();
    }
}

exports.viewAll = async function(req, res) 
{
    try {
        let query;

        try {
            query = {
                start_index: Number(req.query.startIndex),
                count: Number(req.query.count),
                query: req.query.q,
                category_id: Number(req.query.categoryId),
                author_id: Number(req.query.authorId),
                sort_by: req.query.sortBy
            }
    
            if (await categories.get(query.category_id) == null || 
                !query.sort_by in ["ALPHABETICAL_ASC", "ALPHABETICAL_DESC", "SIGNATURES_ASC", "SIGNATURES_DESC"]) {
                throw new Error("assertion failed");
            }
    
            console.log("Petition request for", query);
        } catch (err) {
            console.error(err)
            res.status(400).send()
        }

        const matched = await petitions.search(query);

        let response = []
        for (const match of matched) {
            response.push({
                petitionId: match.petition_id,
                title: match.title,
                category: (await categories.get(match.category_id)).name,
                authorName: (await users.get(match.author_id)).name,
                signatureCount: match.signatures
            });
        }

        console.log("Responded with", response);
        res.status(200).send(response);
    } catch (err) {
        console.error(err)
        res.status(500).send();
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
