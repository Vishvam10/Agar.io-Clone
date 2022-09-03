// The main sockets stuff

const io = require("../servers").io;
const orb = require("./classes/orbs");

const Player = require('./classes/player');
const PlayerConfig = require('./classes/playerConfig');
const PlayerData = require('./classes/playerData');

let orbs = [];
let players = [];

let settings = {
    defaultOrbs : 500,
    defaultSpeed : 6,
    defaultSize: 6,
    // As the player gets bigger, the zoom needs to go out
    defaultZoom : 1.5,
    worldWidth : 500,
    worldHeight : 500
}

initGame();

io.sockets.on("connect", (socket) => {
    // A player has connected
    
    socket.on("init", (data) => {
        // 1. Make a playerConfig() object
        let playerConfig = new PlayerConfig(settings)
        
        // 2. Make a playerData() object
        let playerData = new PlayerData(data.playerName, settings)
        
        // 3. Make a master player object to hold them both
        let player = new Player(socket.id, playerConfig, playerData)
    
        socket.emit("initReturn", {
            orbs
        })
        players.push(playerData);
    })

})

function initGame() {
    for(let i=0; i<settings.defaultOrbs; i++) {
        orbs.push(new orb(settings))
    }
}

module.exports = io;