import { useEffect, useReducer } from "react";
import { initial_state, reducer } from "./Reducer";
import "./App.css";

function App() {
  const [{ text, isOpen, msg, socket }, dispatch] = useReducer(
    reducer,
    initial_state
  );

  useEffect(() => {
    const url = "ws://localhost:1200";
    const ws = new WebSocket(url);
    dispatch({ type: "setSocket", payload: ws });
    ws.onopen = () => {
      console.log("server is Listening!");
      // setting up state of input dom according to server
      dispatch({ type: "setOpen", payload: true });
    };
    ws.onmessage = (e) => {
      //getting data in json string
      dispatch({ type: "setMsg", payload: JSON.parse(e.data) });
    };
    ws.onerror = () => {
      console.log("error occured!");
      dispatch({ type: "setOpen", payload: false });
    };
  }, []);

  function sendMessage() {
    if (text) {
      socket.send(text);
      dispatch({ type: "setText", payload: "" });
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
        onChange={(e) => dispatch({ type: "setText", payload: e.target.value })}
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
