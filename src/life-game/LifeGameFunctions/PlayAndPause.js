function PlayAndPause() {
  window.addEventListener("message", (event) => {
    if (event.data.type === "play-pause") {
      console.log("Play/Pause toggled");
    }
  });
}

export default PlayAndPause;
