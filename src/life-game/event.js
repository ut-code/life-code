const on = {};

let timerId = 0;

window.addEventListener("message", (event) => {
  const handler = on[event.data.type];
  if (handler) {
    handler(event.data);
  }
});
