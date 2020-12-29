const express = require("express");
const bodyParser = require("body-parser");
const { randomBytes } = require("crypto");
const cors = require("cors");
const axios = require("axios");
const app = express();

const port = 4002;

app.use(bodyParser.json());
app.use(cors());

const commentsByPostIds = {};

app.post("/posts/:id/comments/create", async (req, res) => {
  const id = randomBytes(4).toString("hex");
  const { comment } = req.body;

  const comments = commentsByPostIds[req.params.id] || [];

  const commentData = { id, comment, status: "pending" };
  comments.push(commentData);
  commentsByPostIds[req.params.id] = comments;
  try {
    await axios.post("http://event-bus-depl-srv:4004/events", {
      type: "CommentCreated",
      data: { postId: req.params.id, id, comment, status: "pending" },
    });
  } catch (error) {
    console.log(error);
  }
  res.status(201).send(comments);
});

app.get("/posts/:id/comments", (req, res) => {
  res.send(commentsByPostIds[req.params.id] || []);
});

app.post("/events", async (req, res) => {
  console.log("commentService received event");
  if (req.body.type === "commentModerated") {
    const {
      data: { postId, status, id },
    } = req.body;
    const comment = commentsByPostIds[postId].find((comment) => {
      return comment.id == id;
    });

    comment.status = status;
    const eventData = {
      type: "CommentUpdated",
      data: { ...req.body.data },
    };
    await axios.post("http://event-bus-depl-srv:4004/events", {
      type: "CommentUpdated",
      data: { id, postId, status, comment },
    });
  }
  res.send({});
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
