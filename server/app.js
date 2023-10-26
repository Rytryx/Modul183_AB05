const express = require("express");
const http = require("http");
const { rateLimit } = require("express-rate-limit");
const { initializeAPI } = require("./api");

const app = express();
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 Minute
  limit: 50, // limit each IP to 50 requests per windowMs
  standardHeaders: "draft-7",
  legacyHeaders: false,
});

app.use(limiter);
app.use(express.json());
const server = http.createServer(app);

app.use(express.static("client"));
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/client/index.html");
});

initializeAPI(app);

const serverPort = process.env.PORT || 3000;
server.listen(serverPort, () => {
  console.log(`Express Server started on port ${serverPort}`);
});