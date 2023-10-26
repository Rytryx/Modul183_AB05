const express = require("express");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const { initializeDatabase, queryDB, insertDB } = require("./database");
const jwt = require("jsonwebtoken");

let db;

const jwtSecret = process.env.JWT_SECRET || "supersecret";

const initializeAPI = async (app) => {
  db = initializeDatabase();

  app.post(
    "/api/login",
    body("username")
      .notEmpty()
      .withMessage("Username is required.")
      .isEmail()
      .withMessage("Invalid email format."),
    body("password")
      .isLength({ min: 10, max: 64 })
      .withMessage("Password must be between 10 to 64 characters.")
      .escape(),
    login
  );

  app.post(
    "/api/posts",
    body("title").notEmpty().withMessage("Title is required."),
    body("content").notEmpty().withMessage("Content is required."),
    createPost
  );

  app.get("/api/posts", getPosts);
};

const login = async (req, res) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    const formattedErrors = [];
    result.array().forEach((error) => {
      formattedErrors.push({ [error.param]: error.msg });
    });
    return res.status(400).json(formattedErrors);
  }

  const { username, password } = req.body;
  const getUserQuery = `SELECT * FROM users WHERE username = '${username}';`;
  const user = await queryDB(db, getUserQuery);
  if (user.length === 0) {
    return res.status(401).json({ username: "Username does not exist. Or Password is incorrect." });
  }

  const hash = user[0].password;
  const match = await bcrypt.compare(password, hash);
  if (!match) {
    return res.status(401).json({ username: "Username does not exist. Or Password is incorrect." });
  }

  const token = jwt.sign(
    {
      exp: Math.floor(Date.now() / 1000) + 60 * 60,
      data: { username, roles: [user[0].role] },
    },
    jwtSecret
  );

  return res.send(token);
};

const createPost = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { title, content } = req.body;
  const insertPostQuery = `INSERT INTO posts (title, content) VALUES (?, ?)`;

  try {
    await insertDB(db, insertPostQuery, [title, content]);
    res.status(201).json({ message: 'Post created successfully' });
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getPostsFromDB = async () => {
  const getPostsQuery = `SELECT * FROM posts;`;
  try {
    const posts = await queryDB(db, getPostsQuery);
    console.log("Posts from DB:", posts);
    return posts;
  } catch (error) {
    console.error("Error querying posts from DB:", error);
    throw error;
  }
};

const getPosts = async (req, res) => {
  try {
    const posts = await getPostsFromDB();
    console.log("Sending posts:", posts);
    return res.json(posts);
  } catch (error) {
    console.error("Error retrieving posts:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
};

module.exports = { initializeAPI };
