const express = require("express");
const bodyParser = require("body-parser");
const { randomBytes } = require("crypto");
const cors = require("cors");
const axios = require("axios");

const port = 4001;

const app = express();

app.use(bodyParser.json());
app.use(cors());

const posts = {};

app.post("/posts/create", async (req, res) => {
  console.log("posts received event");
  const id = randomBytes(4).toString("hex");
  const { title } = req.body;
  posts[id] = { id, title };
  try {
    await axios.post("http://event-bus-depl-srv:4004/events", {
      type: "PostCreated",
      data: posts[id],
    });
  } catch (error) {
    console.log(error);
  }
  res.status(201).send(posts[id]);
});

app.post("/events", (req, res) => {
  console.log("Event received PostService", req.body);
  res.send({});
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
