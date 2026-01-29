const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const jwt = require('jsonwebtoken');
const axios = require('axios');
const general = express.Router();


public_users.post("/register", (req,res) => {
        const { username, password } = req.body;
    
        // Check if username and password are provided
        if (!username || !password) {
            return res
                .status(400)
                .json({ message: "Username and password are required" });
        }
    
        // Check if user already exists
        const userExists = users.some(user => user.username === username);
    
        if (userExists) {
            return res
                .status(409)
                .json({ message: "Username already exists" });
        }
    
        // Register new user
        users.push({ username, password });
    
        return res
            .status(201)
            .json({ message: "User successfully registered" });
    });

public_users.post('/customer/login', function (req, res) {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
        return res
            .status(400)
            .json({ message: "Username and password are required" });
    }

    // Check if user exists
    const validUser = users.find(
        user => user.username === username && user.password === password
    );

    if (!validUser) {
        return res
            .status(401)
            .json({ message: "Invalid username or password" });
    }

    // Generate JWT
    const accessToken = jwt.sign(
        { username: username },
        "access",
        { expiresIn: "1h" }
    );

    // Save token in session
    req.session.authorization = {
        accessToken,
        username
    };

    return res
        .status(200)
        .json({ message: "User successfully logged in" });
});


// Get the book list available in the shop
  // GET route for all books
public_users.get('/', function (req, res) {
    // Assuming your books are stored in a variable called 'books'
    // Use JSON.stringify with 4 spaces for nice formatting
    res.send(JSON.stringify(books, null, 4));
});

general.get('/', async (req, res) => {
    try {
        const response = await axios.get('http://localhost:5000/');
        res.status(200).json(response.data);
    } catch (error) {
        res.status(500).json({ message: "Error retrieving books" });
    }
});

general.get('/isbn/:isbn', async (req, res) => {
    const isbn = req.params.isbn;

    try {
        const response = await axios.get(`http://localhost:5000/isbn/${isbn}`);
        res.status(200).json(response.data);
    } catch (error) {
        res.status(404).json({ message: "Book not found" });
    }
});


  
general.get('/author/:author', async (req, res) => {
    const author = req.params.author;

    try {
        const response = await axios.get('http://localhost:5000/');
        const booksData = response.data;

        const result = Object.values(booksData).filter(
            book => book.author.toLowerCase() === author.toLowerCase()
        );

        if (result.length > 0) {
            res.status(200).json(result);
        } else {
            res.status(404).json({ message: "Author not found" });
        }
    } catch (error) {
        res.status(500).json({ message: "Error retrieving books" });
    }
});


general.get('/title/:title', async (req, res) => {
    const title = req.params.title;

    try {
        const response = await axios.get('http://localhost:5000/');
        const booksData = response.data;

        const result = Object.values(booksData).filter(
            book => book.title.toLowerCase() === title.toLowerCase()
        );

        if (result.length > 0) {
            res.status(200).json(result);
        } else {
            res.status(404).json({ message: "Title not found" });
        }
    } catch (error) {
        res.status(500).json({ message: "Error retrieving books" });
    }
});


//  Get book review
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;

    if (books[isbn]) {
        res.status(200).json(books[isbn].reviews);
    } else {
        res.status(404).json({ message: "Book not found" });
    }
});


module.exports.general = general;
module.exports.public_users = public_users;

