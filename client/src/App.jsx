import { useEffect, useReducer, useState } from "react";
import { initial_state, reducer } from "./Reducer";
import "./App.css";

function App() {
  const [{ text, isOpen, msg, socket, user }, dispatch] = useReducer(
    reducer,
    initial_state
  );

  const [send, setSend] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("user")) {
      console.log("user found!");
      dispatch({ type: "setUser", payload: localStorage.getItem("user") });
    } else {
      console.log("No user found!", user);
      if (user && send) {
        const checkUsername = async () => {
          try {
            const res = await fetch("http://127.0.0.1:1200/checkUser", {
              method: "post",
              headers: { "Content-type": "application/json" },
              body: JSON.stringify({ user: user.toLowerCase() }),
            }).catch((e) => {
              throw new Error(e);
            });
            if (res.status === 200) {
              console.log(user, "No username!");
              localStorage.setItem("user", user.toLowerCase());
              dispatch({
                type: "setUser",
                payload: localStorage.getItem("user"),
              });
            } else {
              console.log(user, "Username exist");
            }
          } catch (e) {
            console.log(e.message);
          }
          setSend(false);
        };
        checkUsername();
      }
    }
  }, [send]);

  useEffect(() => {
    console.log("change in user");
  }, [user]);

  useEffect(() => {
    if (!localStorage.getItem("user")) {
      console.log("user not found!", user);
      return;
    }
    const url = "ws://127.0.0.1:1200";
    const ws = new WebSocket(url);

    dispatch({ type: "setSocket", payload: ws });
    ws.onopen = () => {
      console.log("server is Listening!");
      // setting up state of input dom according to server
      dispatch({ type: "setOpen", payload: true });
    };
    ws.onmessage = (e) => {
      //getting data in json string
      console.log(JSON.parse(e.data));
      dispatch({ type: "setMsg", payload: JSON.parse(e.data) });
    };
    ws.onerror = (error) => {
      alert("error occured re!", error);
      dispatch({ type: "setOpen", payload: false });
    };
    ws.onclose = () => {
      const reload = confirm(`Something went wrong!\nReload!!`);
      if (reload) location.reload();
    };
  }, [localStorage.getItem("user")]);

  function sendMessage() {
    if (text) {
      socket.send(JSON.stringify({ msg: text, sender: user }));
      dispatch({ type: "setText", payload: "" });
    }
  }

  return (
    <>
      {localStorage.getItem("user") ? (
        <div className="chat-outer-con">
          <h2 className="" style={{ color: "white" }}>
            This is Websocket demo app
          </h2>
          <div className="msg-list-container">
            {msg.length > 0 ? (
              msg.map((ele, index) => {
                // ele is string
                if (ele.sender !== user)
                  return (
                    <div key={index} className="msg-container">
                      <div className="msg-sender">{ele.sender}</div>
                      <li className="msg">{ele.msg}</li>
                    </div>
                  );
                else
                  return (
                    <div
                      key={index}
                      className="msg-container msg-container-user"
                    >
                      <li className="msg">{ele.msg}</li>
                    </div>
                  );
              })
            ) : (
              <span style={{ color: "white", margin: "auto" }}>No chats!!</span>
            )}
          </div>
          <div className="input-con">
            <input
              type="text"
              onChange={(e) =>
                dispatch({ type: "setText", payload: e.target.value })
              }
              value={text}
              min={2}
            />
            <button onClick={() => sendMessage()} disabled={!isOpen}>
              Send
            </button>
          </div>
        </div>
      ) : (
        <div className="UserField">
          <h2 style={{ color: "white" }}>Enter username!</h2>
          <input
            type="text"
            value={user}
            onChange={(e) =>
              dispatch({ type: "setUser", payload: e.target.value.toString() })
            }
          />
          <button onClick={() => setSend(true)}>Check!</button>
        </div>
      )}
    </>
  );
}

export default App;
