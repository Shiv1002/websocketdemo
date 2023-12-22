// create a http server
// const http = require("http");
// const server = http.createServer();
// create a websocket server
const ws = require("ws");
const fs = require("fs");

const filename = "chatlog.json";

const wsServer = new ws.WebSocketServer({ port: 1200 }, () =>
  console.log("websocket server running on port 1200 🔥")
);

wsServer.on("connection", (ws, req) => {
  ws.onmessage = (e) => {
    console.log(`received ${e.data}`);
    writeLog(e.data)
      .then((res) => {
        sendMessages();
        console.log(res);
      })
      .catch((err) => console.log(err));
  };
  ws.onerror = () => {
    console.log("error");
  };

  console.log("someone connected 🤫:", wsServer.clients.size);
  // sending logs to clients
  sendMessages();
});

const sendMessages = () => {
  console.log("Broadcasting it");
  wsServer.clients.forEach((ws) => {
    readLog()
      .then((log) => ws.send(JSON.stringify(log)))
      .catch((err) => console.log(err));
  });
};

const writeLog = (data) => {
  console.log("Writing to log ✍");
  return new Promise(async (resolve, reject) => {
    let logs = await readLog();
    fs.writeFile(filename, JSON.stringify([...logs, data]), (err, content) => {
      if (err) {
        console.log("could write due to 👎", err.message);
        reject(err);
      } else {
        resolve("write successfully!");
      }
    });
  });
};

const readLog = () => {
  console.log("Reading logs 📖");
  return new Promise((resolve, reject) => {
    fs.readFile(filename, "utf8", (err, data) => {
      if (err) {
        console.log("could not log due to 👎", err.message);
        reject(err);
      } else {
        console.log("Read successful");
        resolve(JSON.parse(data));
      }
    });
  });
};
