const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  const { username, password } = req.body;

  if(!username) return res.status(400).json({message: "Username was not provided"})
  if(!password) return res.status(400).json({message: "Password was not provided"})

  users.push({ username, password });
  return res.status(201).json({message: "User " + username + " was created with success"});
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  const bookList = Object.entries(books).map(([id, book]) => ({
    id,
    ...book
  }));

  const prettyJSON = JSON.stringify(bookList, null, 2);
  res.setHeader('Content-Type', 'application/json');
  return res.status(200).send(prettyJSON);
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  const { isbn } = req.params;
  const bookByIsbn = books[isbn];

  if(bookByIsbn) return res.status(200).json(bookByIsbn);
  return res.status(404).json({message: "Book was not found"});
});

// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  const { author } = req.params;
  const bookList = Object.values(books);
  const booksByAuthor = bookList.filter( book => book.author.toLowerCase() === author.toLowerCase())

  if (booksByAuthor.length > 0 ) return res.status(200).json(booksByAuthor);
  return res.status(404).json({message: "No book was found under that author name"});
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  const { title } = req.params;
  const bookList = Object.values(books);
  const bookByTitle = bookList.find( book => book.title.toLowerCase().includes(title.toLowerCase()));

  if(bookByTitle) return res.status(200).json(bookByTitle);
  return res.status(404).json({message: "No book was found under that title"});
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const { isbn } = req.params;
  const bookByIsbn = books[isbn];

  if(!bookByIsbn) return res.status(404).json({message: "Book not found"});
  if(!bookByIsbn.reviews || Object.keys(bookByIsbn.reviews).length === 0) return res.status(404).json({message: "There are no reviews for this book"});
  const bookReviews = Object.values(bookByIsbn.reviews);
  return res.status(200).json(bookReviews);
});

module.exports.general = public_users;
