const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
}

const authenticatedUser = (username,password)=>{ //returns boolean
//write code to check if username and password match the one we have in records.
}

//only registered users can login
regd_users.post("/login", (req,res) => {
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

 // Add or modify a book review (Task 8)
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;          // Get ISBN from URL
    const review = req.query.review;       // Get review from query string
    const username = req.session.authorization?.username; // Get logged-in username from session

    // Check if user is logged in
    if (!username) {
        return res.status(401).json({ message: "User not logged in" });
    }

    // Check if book exists
    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found" });
    }

    // Add or update review
    books[isbn].reviews[username] = review;

    // Return success message with current reviews
    return res.status(200).json({
        message: `Review added/updated for ISBN ${isbn}`,
        reviews: books[isbn].reviews
    });
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;

    // Check if the book exists
    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found" });
    }

    const username = req.user.username; // Get logged-in user from session

    // Check if the user has a review for this book
    if (!books[isbn].reviews[username]) {
        return res.status(404).json({ message: "You have not posted a review for this book" });
    }

    // Delete the user's review
    delete books[isbn].reviews[username];

    res.status(200).json({
        message: `Your review for ISBN ${isbn} has been deleted`,
        reviews: books[isbn].reviews
    });
});


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
