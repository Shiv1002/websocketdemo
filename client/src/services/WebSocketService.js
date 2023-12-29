import React, { useState, useEffect, useReducer, useRef } from "react";

import { toast } from "react-hot-toast";

export default function WebSocketService(msg, socket, dispatch) {
  const msgRef = useRef(msg);
  useEffect(() => {
    if (!localStorage.getItem("user")) {
      return;
    }
    let url, ws_url, ws, toast_for_loading_data;
    try {
      //connecting to server
      url = new URL(
        import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:1200"
      );
      if (import.meta.env.PROD) ws_url = "wss:" + url.host;
      else ws_url = "ws:" + url.host;
      ws = new WebSocket(ws_url);
      // loading data
      toast_for_loading_data = toast.loading("fetching data", {
        duration: Infinity,
      });
    } catch (e) {
      toast.error(e.message);
      console.log(e.message);
      return;
    }

    // ws fntions
    ws.onopen = () => {
      console.log("server is listening");
      dispatch({ type: "setOpen", payload: true });
    };

    ws.onmessage = (e) => {
      toast.dismiss(toast_for_loading_data);
      if (msgRef.current.length === 0)
        toast.success("Data fetch successfully!", { duration: 10000 });
      msgRef.current = JSON.parse(e.data);
      dispatch({ type: "setMsg", payload: JSON.parse(e.data) });
    };

    ws.onclose = () => {
      console.log("closing connection");
      toast.error("Connection with server is closed\nPlease refresh!", {
        position: "top-center",
        duration: Infinity,
      });
    };

    ws.onerror = () => {
      toast.dismiss();
      toast.error("Something went wrong!", {
        position: "top-center",
        duration: 3000,
      });
      console.log("error occured!");
      dispatch({ type: "setOpen", payload: false });
    };

    dispatch({ type: "setSocket", payload: ws });

    return () => {
      ws.close();
    };
  }, [localStorage.getItem("user")]);

  const sendMessage = (data) => {
    console.log("Sending data to server");
    socket.send(JSON.stringify(data));
  };

  return { sendMessage };
}
