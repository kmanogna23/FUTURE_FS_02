const express = require("express");
const router = express.Router();

const db = require("../db");


// GET all leads
router.get("/", (req, res) => {

    const sql = "SELECT * FROM leads";

    db.query(sql, (err, result) => {

        if (err) {
            console.log(err);
            res.status(500).send("Error fetching leads");
        } else {
            res.json(result);
        }
    });
});


// ADD new lead
router.post("/", (req, res) => {

    const { name, email, phone, source, status, notes } = req.body;

    const sql = `
        INSERT INTO leads 
        (name, email, phone, source, status, notes)
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [name, email, phone, source, status, notes],
        (err, result) => {

            if (err) {
                console.log(err);
                res.status(500).send("Error adding lead");
            } else {
                res.send("Lead Added Successfully");
            }
        }
    );
});


// DELETE lead
router.delete("/:id", (req, res) => {

    const sql = "DELETE FROM leads WHERE id = ?";

    db.query(sql, [req.params.id], (err, result) => {

        if (err) {
            console.log(err);
            res.status(500).send("Error deleting lead");
        } else {
            res.send("Lead Deleted Successfully");
        }
    });
});


// UPDATE lead
router.put("/:id", (req, res) => {

    const { name, email, phone, source, status, notes } = req.body;

    const sql = `
        UPDATE leads
        SET name=?, email=?, phone=?, source=?, status=?, notes=?
        WHERE id=?
    `;

    db.query(
        sql,
        [name, email, phone, source, status, notes, req.params.id],
        (err, result) => {

            if (err) {
                console.log(err);
                res.status(500).send("Error updating lead");
            } else {
                res.send("Lead Updated Successfully");
            }
        }
    );
});

module.exports = router;