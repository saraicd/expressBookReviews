const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{
  return users.some((user) => user.username === username);
}

const authenticatedUser = (username,password)=>{
  const user = users.find((user) => user.username === username);
  return user && user.password === password;
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const {  username, password } = req.body;

  if(!isValid(username)) return res.status(400).json({ message: "Invalid username"});
  if(!authenticatedUser(username, password)) return res.status(401).json({ message: "Invalid password"});

  const token = jwt.sign({ username }, "fingerprint_customer", { expiresIn: "1h" });

  req.session.authorization = {
    accessToken: token,
    username: username
  };

  return res.status(200).json({
    message: "Login successful",
    token,
  });
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const { isbn } = req.params;
  const { review } = req.query;

  if (!review) return res.status(400).json({ message: "Review must be provided" });
console.log(req.session)
  const username = req.session.authorization.username;
  if (!username) return res.status(403).json({ message: "You must be logged in to post a review" });

  const book = books[isbn];
  if (!book) return res.status(404).json({ message: "Book not found" });

  if (book.reviews && book.reviews[username]) {
    book.reviews[username] = review; // Modify the existing review
    return res.status(200).json({ message: `Review for book ${book.title} updated successfully` });
  }

  if (!book.reviews) book.reviews = {};

  book.reviews[username] = review;

  return res.status(200).json({ message: `Review for book ${book.title} added successfully` });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
