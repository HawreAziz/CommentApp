const express = require("express");
const cors = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");

const app = express();
const port = 4005;

app.use(cors());
app.use(bodyParser.json());

app.post("/moderateEvents", async (req, res) => {
  const { type, data } = req.body;
  console.log(`Moderate got ${req.body}`);
  if (type === "CommentCreated") {
    setTimeout(async () => {
      const status = data.comment.includes("orange") ? "rejected" : "approved";
      const eventData = {
        type: "commentModerated",
        data: {
          postId: data.postId,
          id: data.id,
          comment: data.comment,
          status,
        },
      };
      await axios.post("http://event-bus-depl-srv:4004/events", eventData);
    }, 6000);
  }
  res.status(201).send({});
});

app.listen(port, () => {
  console.log("[ModerateService]: Listening on port", port);
});
