const petitions = require("../models/petitions.model");
const categories = require("../models/categories.model");
const users = require("../models/users.model");

exports.view = async function(req, res) 
{
    try {
        const id = req.params.id;
        console.log("Petition request view", id);

        const petition = await petitions.get(req.params.id);

        if (petition == null) {
            console.error("Petition not found")
            res.status(404).send();
            return;
        }

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

        res.status(200).send(response);
        console.log("Responded with", response);
    } catch (err) {
        console.error(err)
        res.status(500).send();
    }
}

exports.search = async function(req, res) 
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
    
            console.log("Petition request search", query);
        } catch (err) {
            console.error(err)
            res.status(400).send()
            return;
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

        res.status(200).send(response);
        console.log("Responded with", response);
    } catch (err) {
        console.error(err)
        res.status(500).send();
    }
}

exports.add = async function(req, res) 
{
    try {
        let newPet;

        try {
            const data = req.body;
            console.log("Petition request add", data);

            newPet = {
                title: data.title,
                description: data.description,
                category_id: data.categoryId,
                closing_date: data.closingDate
            }
        } catch (err) {
            console.error(err);
            res.status(400).send();
            return;
        }

        newPet = await petitions.add(newPet);
        res.status(201).send(newPet.insertedId);
        console.log("Responded with", newPet.insertedId);
    } catch (err) {
        console.error(err);
        res.status(500).send();
    }
}

exports.update = async function(req, res) 
{
    try {
        const id = req.params.id;
        const data = req.body;

        console.log(`Petition request update ${id} with`, data);

        const petition = await petitions.get(id);

        if (petition == null) {
            console.error("Petition not found");
            res.status(404).send();
            return;
        }

        await petitions.update({
            title: data.title,
            description: data.description,
            category_id: data.categoryId,
            closing_date: closingDate
        });

        res.status(200).send();
        console.log("Responded")
    } catch (err) {
        console.error(err);
        res.status(500).send();
    }
}

exports.delete = async function(req, res) 
{
    try {
        const id = req.params.id;
        console.log(`Petition resquest view ${id}`);

        const petition = await petitions.get(id);

        if (petition == null) {
            console.error("Petition not found");
            res.status(404).send();
            return;
        }

        await petitions.delete(id);

        res.status(200).send();
        console.log("Responded");
    } catch (err) {
        console.error(err)
        res.status(500).send();
    }
}

exports.categories = async function(_, res) 
{
    try {
        console.log("Petition request view categories");
        
        category = await categories.getAll();

        response = []
        for (const value of category) {
            response.push({
                categoryId: value.category_id,
                name: value.name
            });
        }

        res.status(200).send(response);
        console.log("Responded with", response);
    } catch (err) {
        console.error(err)
        res.status(500).send();
    }
}
