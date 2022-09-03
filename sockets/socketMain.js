// The main sockets stuff

const io = require("../servers").io;
const orb = require("./classes/orbs");
let orbs = []

initGame();

io.sockets.on("connect", (socket) => {
    socket.emit("init", {
        orbs
    })
})

function initGame() {
    for(let i=0; i<500; i++) {
        orbs.push(new orb())
    }
}

module.exports = io;