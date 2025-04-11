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

  return res.status(200).json({
    message: "Login successful",
    token,
  });
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  //Write your code here
  return res.status(300).json({message: "Yet to be implemented"});
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
