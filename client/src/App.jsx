import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [text, setText] = useState("");
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const url = "ws://localhost:1200";
    const ws = new WebSocket(url);
    setSocket(ws);
    ws.onopen = () => {
      console.log("server is Listening!");
    };
    ws.onmessage = (e) => {
      console.log(JSON.parse(e.data));
    };
    ws.onerror = () => {
      console.log("error occured!");
    };
  }, []);

  function sendMessage() {
    if (text) socket.send(text);
  }
  return (
    <>
      <h2>This is Websocket demo app</h2>
      <input
        type="text"
        onChange={(e) => setText(e.target.value)}
        value={text}
        min={2}
      />
      <button onClick={() => sendMessage()}>Send</button>
    </>
  );
}

export default App;
