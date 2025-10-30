const on = {};

window.addEventListener("message", (event) => {
  const handler = on[event.data.type];
  if (handler) {
    handler(event.data);
  }
});
