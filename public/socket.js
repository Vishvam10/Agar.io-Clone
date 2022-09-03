let socket = io.connect("http://localhost:8080");

// This function is called when the user clicks on the start button
function init() {
    draw()    

    // Call the init event when the client is ready for the data
    socket.emit("init", {
        playerName: player.name
    })

}

socket.on("initReturn", (data) => {
    orbs = data.orbs;
    setInterval(() => {
        socket.emit("tick", {
            xVector: player.xVector,
            yVector: player.yVector,
        })
    }, 33)
})

socket.on("tock", (data) => {
    players = data.players;
    player.locX = data.playerX;
    player.locY = data.playerY;
})