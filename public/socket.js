let socket = io.connect("http://localhost:8080");

socket.on("init", (data) => {
    orbs = data.orbs;
})