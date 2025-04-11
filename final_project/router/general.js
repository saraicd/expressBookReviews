const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  const { username, password } = req.body;
  const sameUser = isValid(username);

  if(sameUser) return res.status(400).json({message: "Username already exists"})
  if(!username) return res.status(400).json({message: "Username was not provided"})
  if(!password) return res.status(400).json({message: "Password was not provided"})

  users.push({ username, password });
  return res.status(201).json({message: "User " + username + " was created with success"});
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
  const getBooks = new Promise((resolve, reject) => {
    const bookList = Object.entries(books).map(([id, book]) => ({
      id,
      ...book
    }));

    if (bookList.length > 0) {
      resolve(bookList);
    } else {
      reject("No books found");
    }
  });

  getBooks
    .then((bookList) => {
      res.setHeader('Content-Type', 'application/json');
      return res.status(200).send(JSON.stringify(bookList, null, 2));
    })
    .catch((err) => {
      return res.status(500).json({ message: err });
    });
});


// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  const { isbn } = req.params;

  const getBookByISBN = new Promise((resolve, reject) => {
    const book = books[isbn];
    if (book) {
      resolve(book);
    } else {
      reject("Book was not found");
    }
  });

  getBookByISBN
    .then((book) => {
      return res.status(200).json(book);
    })
    .catch((err) => {
      return res.status(404).json({ message: err });
    });
});

// Get book details based on author
public_users.get('/author/:author', function (req, res) {
  const { author } = req.params;

  const getBooksByAuthor = new Promise((resolve, reject) => {
    const bookList = Object.values(books);
    const booksByAuthor = bookList.filter(book => book.author.toLowerCase() === author.toLowerCase());

    if (booksByAuthor.length > 0) {
      resolve(booksByAuthor);
    } else {
      reject("No book was found under that author name");
    }
  });

  getBooksByAuthor
    .then((books) => res.status(200).json(books))
    .catch((err) => res.status(404).json({ message: err }));
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
  const { title } = req.params;

  const getBooksByTitle = new Promise((resolve, reject) => {
    const bookList = Object.values(books);
    const bookByTitle = bookList.find(book => book.title.toLowerCase().includes(title.toLowerCase()));

    if (bookByTitle) {
      resolve(bookByTitle);
    } else {
      reject("No book was found under that title");
    }
  });

  getBooksByTitle
    .then((book) => res.status(200).json(book))
    .catch((err) => res.status(404).json({ message: err }));
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
