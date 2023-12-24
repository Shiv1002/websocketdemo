import { useEffect, useReducer, useState } from "react";
import { initial_state, reducer } from "./reducers/Reducer.js";
import "./App.css";
import { toast, Toaster } from "react-hot-toast";

function App() {
  let server_url;
  if (import.meta.env.DEV) {
    server_url = "http://127.0.0.1:1200";
    console.log("DevTime 🎉");
  } else {
    server_url = import.meta.env.VITE_BACKEND_URL;
    console.log("ProductionTime 😎");
  }
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
            const res = await fetch(server_url + "/checkuser", {
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
              toast.success("Created Username!");
            } else {
              toast.error("Username already exist!", {
                position: "top-center",
                duration: 3000,
              });
              console.log(user, "Username exist");
            }
          } catch (e) {
            console.log(e.message);
            toast.error("Something went wrong!", {
              position: "top-center",
              duration: 3000,
            });
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

  const scrollDown = () => {
    console.log("scrolling down");
    try {
      document.querySelector(".msg-list-container").scrollTop =
        document.querySelector(".msg-list-container").scrollHeight;
    } catch (e) {
      console.log("UI not loaded");
    }
  };
  useEffect(() => scrollDown(), [msg]);

  useEffect(() => {
    if (!localStorage.getItem("user")) {
      console.log("user not found!", user);
      return;
    }
    const url = new URL(server_url);
    const ws_url = "ws:" + url.host;
    const ws = new WebSocket(ws_url);

    dispatch({ type: "setSocket", payload: ws });
    ws.onopen = () => {
      console.log("server is Listening!");
      // setting up state of input dom according to server
      dispatch({ type: "setOpen", payload: true });
    };
    ws.onmessage = async (e) => {
      //getting data in json string
      console.log(JSON.parse(e.data));
      dispatch({ type: "setMsg", payload: JSON.parse(e.data) });
    };
    ws.onerror = () => {
      toast.error("Something went wrong!", {
        position: "top-center",
        duration: 3000,
      });

      dispatch({ type: "setOpen", payload: false });
      console.log();
      // const reload = confirm(`Something went wrong!\nReload!!`);
      // if (reload) location.reload();
    };
    ws.onclose = () => {
      console.log("closing connection");
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
      <Toaster position="top-right" />
      <div id="App">
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
                <span style={{ color: "white", margin: "auto" }}>
                  No chats!!
                </span>
              )}
            </div>
            <div className="input-con">
              <textarea
                autoFocus
                type="text"
                rows={1}
                onChange={(e) => {
                  const t = e.target;
                  dispatch({ type: "setText", payload: e.target.value });
                  t.style.height = t.style.minHeight = "auto";
                  t.style.height = `${t.scrollHeight + 1}px`;
                }}
                value={text}
                draggable={false}
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
                dispatch({
                  type: "setUser",
                  payload: e.target.value.toString(),
                })
              }
            />
            <button onClick={() => setSend(true)}>Check!</button>
          </div>
        )}
      </div>
    </>
  );
}

export default App;
