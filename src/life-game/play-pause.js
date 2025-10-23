let timerId = 0;

window.addEventListener("message", (event) => {
  if (event.data.type === "play") {
    timer = "start";
    timerId = setInterval(progressBoard, 1000);
  } else if (event.data.type === "pause") {
    timer = "stop";
    clearInterval(timerId);
  }
});
