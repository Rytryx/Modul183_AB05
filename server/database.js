// database.js
const sqlite3 = require("sqlite3").verbose();
const { promisify } = require("util");

const initializeDatabase = () => {
  console.log("Initializing database connection...");
  const db = new sqlite3.Database("./my-database.db");

  const dbRun = promisify(db.run.bind(db));
  const dbAll = promisify(db.all.bind(db));

  const createPostsTableQuery = `
    CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT NOT NULL
    );
  `;

  const checkIfPostsExistQuery = `
    SELECT COUNT(*) AS count FROM posts;
  `;

  const insertPostsQuery = `
    INSERT INTO posts (title, content) VALUES
    ('Post 1', 'This is the content of Post 1.'),
    ('Post 2', 'This is the content of Post 2.'),
    ('Post 3', 'This is the content of Post 3.');
  `;

  dbRun(createPostsTableQuery)
    .then(async () => {
      const countResult = await queryDB(db, checkIfPostsExistQuery);
      const postsExist = countResult[0].count > 0;

      if (!postsExist) {
        return dbRun(insertPostsQuery);
      }
    })
    .then(() => console.log("Posts table created or already exists."))
    .then(() => console.log("Initial posts inserted into the table (if needed)."))
    .catch((err) => console.error("Error:", err));

  return db;
};

const insertDB = (db, query, params) => {
  return new Promise((resolve, reject) => {
    db.run(query, params, function (err) {
      if (err) return reject(err);
      resolve(this.lastID);
    });
  });
};

const queryDB = (db, query, params) => {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
};

module.exports = { initializeDatabase, queryDB, insertDB };
