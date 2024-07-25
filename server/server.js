require('dotenv').config();

const db = require('./db');
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const app = express();

app.use(express.json());
app.use(cors());

// Register a new user
app.post("/api/v1/register", async (req, res) => {
    const { username, password, name, email, phone, role } = req.body;
    try {
        // Check if the username already exists
        const userCheck = await db.query("SELECT * FROM users WHERE username = $1", [username]);
        if (userCheck.rows.length > 0) {
            return res.status(400).json({ status: "error", message: "Username already exists" });
        }

        // Hash the password using bcrypt
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert the new user into the database with all the provided details
        const results = await db.query(
            "INSERT INTO users (username, password, name, email, phone, role) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
            [username, hashedPassword, name, email, phone, role]
        );
        res.status(201).json({ status: "success", data: results.rows[0] });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ status: "error", message: "Internal Server Error" });
    }
});


// Login a user
app.post("/api/v1/login", async (req, res) => {
    const { username, password } = req.body;
    try {
        const results = await db.query("SELECT * FROM users WHERE username = $1", [username]);
        if (results.rows.length > 0) {
            const user = results.rows[0];
            const passwordMatch = await bcrypt.compare(password, user.password);
            if (passwordMatch) {
                // Update the last login time
                await db.query("UPDATE users SET last_login = NOW() WHERE username = $1", [username]);
                res.status(200).json({ status: "success", data: user });
            } else {
                res.status(401).json({ status: "error", message: "Invalid credentials" });
            }
        } else {
            res.status(401).json({ status: "error", message: "Invalid credentials" });
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ status: "error", message: "Internal Server Error" });
    }
});


// Get all users (staff)
app.get("/api/v1/staff", async (req, res) => {
    try {
        const results = await db.query("SELECT * FROM users");
        res.status(200).json({
            status: "success",
            data: results.rows
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ status: "error", message: "Internal Server Error" });
    }
});


// Get all projects
app.get("/api/v1/projects", async (req, res) => {
    try {
        const results = await db.query("SELECT * FROM projects");
        console.log(results);
        res.status(200).json({
            status: "success",
            results: results.rows.length,
            data: { projects: results.rows }
        });
    } catch (err) {
        console.log(err);
    }
});


// Get one project
app.get("/api/v1/projects/:projectid", async (req, res) => {
    console.log(req.params.projectid);

    try {
        const results = await db.query("SELECT * FROM projects WHERE projectid = $1", [req.params.projectid]);
        res.status(200).json({
            status: "success",
            data: {
                project: results.rows[0],
            },
        });

    } catch (err) {
        console.log(err);
    }
});


// Create a project
app.post("/api/v1/projects", async (req, res) => {
    console.log(req.body);

    try {
        const results = await db.query(
            "INSERT INTO projects (projectid, projectname, projectdescription, projectstartdate, projectenddate, projectstatus) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
            [
                //Need the queueries to be made yet
            ]
        );
        console.log(results.rows[0]);

        res.status(201).json({
            status: "success",
            data: { project: results.rows[0] }
        });
    } catch (err) {
        console.log(err.message);
    }
});



// Update a project
app.put("/api/v1/projects/:projectid", async (req, res) => {
    try {
        const results = await db.query(
            "UPDATE projects SET projectname = $1, projectdescription = $2, projectstartdate = $3, projectenddate = $4, projectstatus = $5 WHERE projectid = $6 RETURNING *",
            [
                //Need the queueries to be made yet
            ]
        );
        console.log('Update query executed, results:', results.rows[0]);
        res.status(200).json({
            status: "success",
            data: { project: results.rows[0] }
        });
    } catch (err) {
        console.log(err.message);
    }
});




//delete a project, DELETE
app.delete("/api/v1/projects/:projectid", async (req, res) => {
    try {
        const results = await db.query("DELETE FROM projects WHERE projectid = $1", [req.params.projectid]);
        console.log(results);
        res.status(204).json({
            status: "success",
            data: null
        });
    } catch (err) {
        console.log(err);
    }

});


const port = process.env.PORT || 3007;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});