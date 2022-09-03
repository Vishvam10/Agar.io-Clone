// ===============================
// =========== DRAWING ===========
// ===============================

function draw() {
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.clearRect(0, 0, canvas.width, canvas.height);

    const camX = -player.locX + canvas.width / 2;
    const camY = -player.locY + canvas.height / 2;
    
    context.translate(camX, camY);

    players.forEach((p) => {
        context.beginPath();
        context.fillStyle = p.color;
        context.arc(p.locX, p.locY , p.radius, 0, 2*Math.PI);
        context.fill();
        context.lineWidth = 2;
        context.strokeStyle = "rgb(255,255,255)";
        context.stroke();    
    });

    orbs.forEach((orb) => {
        context.beginPath();
        context.fillStyle = orb.color;
        context.arc(orb.locX, orb.locY, orb.radius, 0, 2*Math.PI);
        context.fill();
    });

    requestAnimationFrame(draw);
}

canvas.addEventListener('mousemove',(event)=>{
    const mousePosition = {
        x: event.clientX,
        y: event.clientY
    };
    const angle = Math.atan2(mousePosition.y - (canvas.height/2), mousePosition.x - (canvas.width/2)) * 180 / Math.PI;
    if(angle >= 0 && angle < 90){
        // console.log("Mouse is in the lower right quad")
        xVector = 1 - (angle/90);
        yVector = -(angle/90);
    } else if(angle >= 90 && angle <= 180){
        // console.log("Mouse is in the lower left quad")
        xVector = -(angle-90)/90;
        yVector = -(1 - ((angle-90)/90));
    } else if(angle >= -180 && angle < -90){
        // console.log("Mouse is in the upper left quad")
        xVector = (angle+90)/90;
        yVector = (1 + ((angle+90)/90));
    } else if(angle < 0 && angle >= -90){
        // console.log("Mouse is in the upper right quad")
        xVector = (angle+90)/90;
        yVector = (1 - ((angle+90)/90));
    }

    player.xVector = xVector;
    player.yVector = yVector;

})