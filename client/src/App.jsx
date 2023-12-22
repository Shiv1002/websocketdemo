import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [text, setText] = useState("");
  const [socket, setSocket] = useState(null);
  const [isOpen, setOpen] = useState(false);
  const [msg, setMsg] = useState([]);
  useEffect(() => {
    const url = "ws://localhost:1200";
    const ws = new WebSocket(url);
    setSocket(ws);
    ws.onopen = () => {
      console.log("server is Listening!");
      // setting up state of input dom according to server
      setOpen(true);
    };
    ws.onmessage = (e) => {
      //getting data in json string
      setMsg(JSON.parse(e.data));
    };
    ws.onerror = () => {
      console.log("error occured!");
      setOpen(false);
    };
  }, []);

  function sendMessage() {
    if (text) {
      socket.send(text);
      setText("");
    }
  }

  return (
    <>
      <h2>This is Websocket demo app</h2>
      <div className="msg-container">
        {msg.map((ele, index) => {
          // ele is string
          return <li key={index}>{ele}</li>;
        })}
      </div>

      <input
        type="text"
        onChange={(e) => setText(e.target.value)}
        value={text}
        min={2}
      />
      <button onClick={() => sendMessage()} disabled={!isOpen}>
        Send
      </button>
    </>
  );
}

export default App;
