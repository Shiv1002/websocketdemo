// create a http server
// const http = require("http");
// const server = http.createServer();
// create a websocket server
const ws = require("ws");
const fs = require("fs");
const express = require("express");
const app = express();
const Chat = require("./chat.js");
const { default: mongoose } = require("mongoose");
const dbURL = "mongodb://127.0.0.1:27017/WBCHAT";

const myserver = app.listen(1200, "127.0.0.1", () =>
  console.log("websocket server running on port 1200 🔥")
);

const wsServer = new ws.Server({ noServer: true });
app.use(express.json());
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});
app.get("/", (req, res) => {
  res.send("This is express app!");
});

app.post("/checkUser", async (req, res) => {
  const user = req.body.user;
  const data = await Chat.findOne({
    sender: user.toString().toLowerCase(),
  }).catch((e) => console.log(e.message));
  if (data) res.status(404).send("Username exist");
  else res.status(200).send("No username!");
});

wsServer.on("connection", (ws, req) => {
  ws.onmessage = (e) => {
    console.log(`received ${e.data}`);
  };
  ws.onerror = (e) => {
    console.log(e);
  };

  console.log("someone connected 🤫:", wsServer.clients.size);
  // sending logs to clients
  sendMessages();
});

const sendMessages = () => {
  console.log("Broadcasting it");
  wsServer.clients.forEach((ws) => {
    getChatFromDB()
      .then((chats) => ws.send(JSON.stringify(chats)))
      .catch((err) => console.log(err));
  });
};

function getChatFromDB() {
  console.log("Get all chats");
  return new Promise(async (resolve, reject) => {
    await Chat.find({})
      .then((res) => resolve(res))
      .catch((e) => reject(e));
  });
}

const appendChat = async (data) => {
  console.log("Pushing in DB");
  const newMsg = new Chat({
    msg: data.msg,
    sender: data.sender.toString().toLowerCase(),
  });
  await newMsg.save().catch((e) => console.log(e.message));
};

const main = async () => {
  await mongoose
    .connect(dbURL)
    .then(() => console.log("Connected to DB", dbURL))
    .catch((e) => console.log(e.message));
};

main();

myserver.on("upgrade", (req, socket, head) => {
  //upgrade from http protocol to websocket
  wsServer.handleUpgrade(req, socket, head, (ws) => {
    //handling upgrade of protocol
    wsServer.emit("connection", ws, req);
    //emmiting connection event
  });
});
