import { useEffect, useReducer, useRef, useState } from "react";
import { initial_state, reducer } from "./reducers/Reducer.js";
import WebSocketService from "./services/WebSocketService.js";
import "./App.css";
import { toast, Toaster } from "react-hot-toast";
function App() {
  const server_url = import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:1200";

  const [{ text, isOpen, msg, socket, user }, dispatch] = useReducer(
    reducer,
    initial_state
  );

  const { sendMessage } = WebSocketService(msg, socket, dispatch);
  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log("DevTime 🎉");
    } else {
      console.log("ProductionTime 😎");
    }
  }, []);

  const [send, setSend] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("user")) {
      console.log("user in storage found!");
      dispatch({ type: "setUser", payload: localStorage.getItem("user") });
    } else {
      console.log("no user in storage found!", user);

      if (user && send) {
        function checkUsername() {
          return new Promise(async (resolve, reject) => {
            await fetch(server_url + "/checkuser", {
              method: "post",
              headers: { "Content-type": "application/json" },
              body: JSON.stringify({ user: user.toLowerCase() }),
            })
              .then((res) => {
                if (res.status === 200) {
                  console.log(user, "No username!");
                  localStorage.setItem("user", user.toLowerCase());
                  dispatch({
                    type: "setUser",
                    payload: localStorage.getItem("user"),
                  });
                  resolve("Created Username!");
                } else {
                  console.log(user, "Username exist");
                  throw new Error("Username exist");
                }
              })
              .catch((e) => {
                reject(e);
              });
          });
        }

        toast.promise(checkUsername(), {
          loading: "fetching user!",
          success: (res) => {
            toast.dismiss();
            return <>{res}</>;
          },
          error: (error) => {
            toast.dismiss();
            return <>{error.message}</>;
          },
        });

        setSend(false);
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

  useEffect(() => {
    console.log(msg);
    scrollDown();
  }, [msg]);

  function sendData() {
    if (text) {
      sendMessage({ msg: text, sender: user });
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
              <button onClick={() => sendData()} disabled={!isOpen}>
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
            <button
              onClick={() => {
                if (!user) {
                  toast.error("Empty name not allowed!");
                  return;
                }
                setSend(true);
              }}
            >
              Check!
            </button>
          </div>
        )}
      </div>
    </>
  );
}

export default App;
