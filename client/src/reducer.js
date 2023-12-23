export const initial_state = {
  text: "",
  isOpen: false,
  msg: [],
  socket: null,
  user: "",
};

export function reducer(state, { type, payload }) {
  switch (type) {
    case "setText":
      return { ...state, text: payload };
    case "setOpen":
      return { ...state, isOpen: payload };
    case "setMsg":
      return { ...state, msg: [...payload] };
    case "setSocket":
      return { ...state, socket: payload };
    case "setUser":
      return { ...state, user: payload };
  }
}
