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
            yVector: player.yVector
        })
    }, 15)
})

socket.on("tock", (data) => {
    players = data.players;
})

socket.on('tickTock',(data)=>{
    player.locX = data.playerX
    player.locY = data.playerY
})


socket.on("orbSwitch", (data) => {
    orbs.splice(data.orbIndex, 1, data.newOrb);
})

socket.on('updateLeaderBoard',(data)=>{
    document.querySelector('.leader-board').innerHTML = "";
    data.forEach((curPlayer)=>{
        document.querySelector('.leader-board').innerHTML += `
            <li class="leaderboard-player">${curPlayer.name} - ${curPlayer.score}</li>
        `
    })
})