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

// Get all books (Promise version)
general.get('/', (req, res) => {
    axios.get('http://localhost:5000/books') // Assuming books are served at /books
        .then(response => {
            res.status(200).json(response.data);
        })
        .catch(error => {
            res.status(500).json({ message: "Error fetching books", error: error.message });
        });
});

module.exports.general = general;

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    axios.get(`http://localhost:5000/books/${isbn}`)
    .then(response => {
        res.status(200).json(response.data);
    })
    .catch(err => {
        res.status(404).json({ message: `Book with ISBN ${isbn} not found` });
    });
    if (books[isbn]) {
        res.status(200).json(books[isbn]);
    } else {
        res.status(404).json({ message: "Book not found" });
    }
});


  
// Get book details based on author
public_users.get('/author/:author', function (req, res) {
    const author = req.params.author.toLowerCase();
    let results = [];

    // Get all keys of the books object
    const bookKeys = Object.keys(books);

    // Iterate through the books
    bookKeys.forEach((key) => {
        if (books[key].author.toLowerCase() === author) {
            results.push(books[key]);
        }
    });

    if (results.length > 0) {
        res.status(200).json(results);
    } else {
        res.status(404).json({ message: "No books found for this author" });
    }
});

// Get book details based on author using async-await
public_users.get('/author/:author', async (req, res) => {
    try {
        const author = req.params.author;
        const allBooks = Object.values(books); // Convert books object to array
        const authorBooks = allBooks.filter(book => book.author.toLowerCase() === author.toLowerCase());

        if (authorBooks.length > 0) {
            // Simulate async behavior (could also call external API with Axios)
            await new Promise(resolve => setTimeout(resolve, 100)); // optional delay
            res.status(200).json(authorBooks);
        } else {
            res.status(404).json({ message: "No books found by this author" });
        }
    } catch (err) {
        res.status(500).json({ message: "Error fetching books by author", error: err.message });
    }
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
    const title = req.params.title.toLowerCase();
    let results = [];

    // Get all keys from books object
    const bookKeys = Object.keys(books);

    // Iterate through books and match title
    bookKeys.forEach((key) => {
        if (books[key].title.toLowerCase() === title) {
            results.push(books[key]);
        }
    });

    if (results.length > 0) {
        res.status(200).json(results);
    } else {
        res.status(404).json({ message: "No books found with this title" });
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


module.exports.general = public_users;
