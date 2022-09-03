// The main sockets stuff

const io = require("../servers").io;
const orb = require("./classes/orb");
const checkForOrbCollisions = require("./checkCollision").checkForOrbCollisions;
const checkForPlayerCollisions = require("./checkCollision").checkForPlayerCollisions;

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
    worldWidth : 2000,
    worldHeight : 2000
}

initGame();

 
// Issue a message to every connected socket every 60 FPS. So, 1/60th of second = 16ms. We will do 15.
setInterval(() => {
    if(players.length > 0) {
        io.to("game").emit("tock", {
            players,
        })
    }
}, 15);

io.sockets.on("connect", (socket) => {
    // A player has connected
    let player = {};
    socket.on("init", (data) => {

        // 0. Add the player to the game namespace
        socket.join("game");

        // 1. Make a playerConfig() object
        let playerConfig = new PlayerConfig(settings)
        
        // 2. Make a playerData() object
        let playerData = new PlayerData(data.playerName, settings)
        
        // 3. Make a master player object to hold them both
        player = new Player(socket.id, playerConfig, playerData)
        
        setInterval(()=>{
            socket.emit('tickTock',{
                playerX: player.playerData.locX,
                playerY: player.playerData.locY,
            });
        },15)
        
        socket.emit("initReturn", {
            orbs
        })
        players.push(playerData);
    })
    // The client sent over a tick which means that we know which direction to move the player 
    socket.on("tick", (data) => {
        speed = player.playerConfig.speed;
        // Update the playerConfig object with the new 
        // direction in data and at the same time create
        // a local variable for this callback for readability
        xV = player.playerConfig.xVector = data.xVector;
        yV = player.playerConfig.yVector = data.yVector;
        if(xV && yV) {
            if((player.playerData.locX < 5 && player.playerData.xVector < 0) || (player.playerData.locX > settings.worldWidth) && (xV > 0)){
                player.playerData.locY -= speed * yV;
            } else if((player.playerData.locY < 5 && yV > 0) || (player.playerData.locY > settings.worldHeight) && (yV < 0)){
                player.playerData.locX += speed * xV;
            } else{
                player.playerData.locX += speed * xV;
                player.playerData.locY -= speed * yV;
            }    
        }

        let capturedOrb = checkForOrbCollisions(player.playerData, player.playerConfig, orbs, settings);
        capturedOrb.then((data) => {
            const orbData = {
                orbIndex : data,
                newOrb : orbs[data]
            }
            // A collision happened
            io.sockets.emit('updateLeaderBoard',getLeaderBoard());
            // Emit to all sockets that the orb is replaced
            io.sockets.emit("orbSwitch", orbData);

        }).catch(() => {
        })

        let playerDeath = checkForPlayerCollisions(player.playerData,player.playerConfig,players,player.socketId)
        playerDeath.then((data)=>{
            // console.log("Player collision!!!")
            // every socket needs to know the leaderBoard has changed
            io.sockets.emit('updateLeaderBoard',getLeaderBoard());
            // a player was absorbed. Let everyone know!
            io.sockets.emit('playerDeath', data);
        }).catch(()=>{
            // console.log("No player collision")
        })

    })
    socket.on('disconnect',(data)=>{
        // console.log(data)
        // find out who just left... which player in players
        // make sure the player exists
        if(player.playerData){
            players.forEach((currPlayer,i)=>{
                // if they match...
                if(currPlayer.uid == player.playerData.uid){
                    // these are the droids we're looking for
                    players.splice(i,1);
                    io.sockets.emit('updateLeaderBoard',getLeaderBoard());
                }
            });
            const updateStats = `
            UPDATE stats
                SET highScore = CASE WHEN highScore < ? THEN ? ELSE highScore END,
                mostOrbs = CASE WHEN mostOrbs < ? THEN ? ELSE mostOrbs END,
                mostPlayers = CASE WHEN mostPlayers < ? THEN ? ELSE mostPlayers END
            WHERE username = ?
            `
        }
    })

})

function getLeaderBoard(){
    // sort the players in desc order
    players.sort((a,b)=>{
        return b.score - a.score;
    });
    let leaderBoard = players.map((curPlayer)=>{
        return{
            name: curPlayer.name,
            score: curPlayer.score
        }
    })
    return leaderBoard
}


function initGame() {
    for(let i=0; i<settings.defaultOrbs; i++) {
        orbs.push(new orb(settings))
    }
}

module.exports = io;