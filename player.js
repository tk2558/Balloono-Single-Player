const playerImage = new Image();
playerImage.src = 'img/monkey.png';

const player = { // player character (monke)
    row: 1, // Spawn coordinates (x)
    col: 1, // Spawn coordinates (y)
    numBombs: 1, // default one bomb
    speed: 1, // default player speed
    bombSize: 3, // default bomb size
    image: playerImage, // player model
    username: "", // player username
    alive: 1, // player status: 0 = dead, 1 = alive, 2 = trapped, 3 = brief moment of invincibility
    trappedTimer: 0,
    bot: false,

    render() {
        const x = this.col * grid;
        const y = this.row * grid;
        context.drawImage(this.image, x, y, grid, grid);

        // Draw the name tag
        context.fillStyle = 'white';
        context.font = '14px Arial';
        context.textAlign = 'center';
        context.fillText(this.username, x + grid / 2, y - 8);
    },
}

function playerTrapped() {
    setTimeout(() => { player.alive = 2; }, 250); // 250 ms of invincibility
    const deathImages = ['img/bubble2.png', 'img/bubble1.png'];
    let imageIdx = 0;
    let volumeCD = .4; // volume countdown

    const deathInterval = setInterval(() => {
        if (player.alive === 0) {
            playerDie()
            clearInterval(deathInterval);
            return;
        }

        if (imageIdx < deathImages.length) {
            player.alive = 2;
            player.image.src = deathImages[imageIdx];
            hitSound.volume = volumeCD;
            hitSound.play();
            imageIdx++;
            volumeCD -= .1;
        }
        else {
            clearInterval(deathInterval);
            imageIdx = 0;
            player.alive = 1; // player alive again
            player.image.src = 'img/monkey.png';
            releaseSound.volume = 0.5;
            releaseSound.play();
        }
    }, 1000);
}

function playerDie() { // Add a function to handle player death
    const playerInfoBox = document.getElementById('playerInfo');
    const playerStatus = document.getElementById('playerImage');

    deathSound.volume = 0.35; // death sound play
    deathSound.play();

    playerInfoBox.classList.add('grayed'); // grayed out status
    playerStatus.src = "img/dead.png"; // player dead on scoreboard
    player.image.src = 'img/tombstone.png';

    setTimeout(() => {
        socket.emit('message', "GAME OVER! REFRESH TO RESTART"); // send msg to server
        endMSG = "GAME OVER";
        gameState = false;
    }, 500);
}