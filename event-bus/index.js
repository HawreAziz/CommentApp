const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const axios = require("axios");

const app = express();

const port = 4004;

app.use(cors());
app.use(bodyParser.json());

const events = [];

app.post("/events", async (req, res) => {
  const event = req.body;
  events.push(event);
  try {
    await axios.post("http://posts-depl-srv:4001/events", event);
    await axios.post("http://comments-depl-srv:4002/events", event);
    await axios.post("http://moderate-depl-srv:4005/moderateEvents", event);
    await axios.post("http://query-service-depl-srv:4003/events", event);
    res.send(req.body);
  } catch (error) {
    console.log(error);
  }
});

app.get("/fetch-events", (req, res) => {
  res.send(events);
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
