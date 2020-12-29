const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const axios = require("axios");

const app = express();

const port = 4003;

app.use(bodyParser.json());
app.use(cors());

const posts = {}; // {id: {id: str, title: str, comments: []}};

const handleEvents = (post) => {
  const { type, data } = post;
  if (type === "PostCreated") {
    const { id, title } = data;
    posts[id] = { id, title, comments: [] };
  }
  if (type === "CommentCreated") {
    const { id, comment, postId, status } = data;
    posts[postId].comments.push({ id, comment, status, status: "pending" });
  }
  if (type === "CommentUpdated") {
    const { postId, id, status, comment } = data;
    const _comment = posts[postId].comments.find((_comment) => {
      return _comment.id === id;
    });
    _comment.status = status;
  }
};

app.post("/events", (req, res) => {
  console.log(`Query service got ${req.body}`);
  handleEvents(req.body);
  res.send({ status: "OK" });
});

app.get("/posts", (req, res) => {
  res.status(201).send(posts);
});

app.get("/events/:postId/comments", (req, res) => {
  res.status(201).send(posts[req.params.postId].comments);
});

app.listen(port, async () => {
  console.log(`Listening on port ${port}`);
  try {
    const response = await axios.get(
      "http://event-bus-depl-srv:4004/fetch-events"
    );
    for (const event of response.data) {
      handleEvents(event);
    }
  } catch (error) {
    console.log(error);
  }
});
