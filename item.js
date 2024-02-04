const powerUps = {
    bombUp: 'bombUp',
    speedUp: 'speedUp',
    rangeUp: 'rangeUp',
};

function getRandomItem() { // random item generator
    const allPowerUps = ['bombUp', 'speedUp', 'rangeUp']; // all power ups
    const randomIdx = Math.floor(Math.random() * allPowerUps.length); // get random item
    return allPowerUps[randomIdx]; // returning random power up
}

// Item Construction
function Item(row, col, power) {
    this.row = row;
    this.col = col;
    this.power = power;
    this.alive = true;
    this.gaugeId = null;
    this.image = new Image();

    this.render = function () {
        const x = (this.col + 0.5) * grid;
        const y = (this.row + 0.5) * grid;
        switch (this.power) {
            case 'bombUp':
                this.image.src = 'img/bomb+.png';
                break;
            case 'speedUp':
                this.image.src = 'img/speed+.png';
                break;
            case 'rangeUp':
                this.image.src = 'img/range+.png';
                break;
        }
        context.drawImage(this.image, x - grid * 0.5, y - grid * 0.5, grid, grid);
    };

    this.update = function (dt) {
        if (player.row === this.row && player.col === this.col) {
            switch (this.power) {
                case 'bombUp':
                    if (player.numBombs < 12) { // MAX 12 BOMBS
                        player.numBombs++; // Update number of bombs
                        this.gaugeId = 'b' + player.numBombs; // Update gauge ID
                        if (player.numBombs === 12) {
                            socket.emit('message', `\xa0` + player.username + " has reached MAX BOMBS!"); // send msg to server
                        }
                    }
                    break;
                case 'speedUp':
                    if (player.speed < 12) { // MAX 12 SPD
                        player.speed++; // Update speed
                        this.gaugeId = 's' + player.speed; // Update gauge ID
                        if (player.speed === 12) {
                            socket.emit('message', `\xa0` + player.username + " has reached MAX SPEED!"); // send msg to server
                        }
                    }
                    break;
                case 'rangeUp':
                    if (player.bombSize < 15) { // MAX 12 BOMB RANGE
                        player.bombSize++; // Update number of bombs
                        this.gaugeId = 'r' + player.bombSize; // Update gauge ID
                        if (player.bombSize === 12) {
                            socket.emit('message', `\xa0` + player.username + " has reached MAX RANGE!"); // send msg to server
                        }
                    }
                    break;
            }
            itemSound.volume = 0.1;
            itemSound.play();
            this.alive = false; // Mark the item as collected or no longer alive
        }

        for (const id in compBots) { // BOTS
            if (compBots[id].row === this.row && compBots[id].col === this.col) {
                switch (this.power) {
                    case 'bombUp':
                        if (compBots[id].numBombs < 12) { // MAX 12 BOMBS
                            compBots[id].numBombs++; // Update number of bombs
                            if (compBots[id].numBombs === 12) {
                                socket.emit('message', `\xa0` + compBots[id].username + " has reached MAX BOMBS!"); // send msg to server
                            }
                        }
                        break;
                    case 'speedUp':
                        if (compBots[id].speed < 12) { // MAX 12 SPD
                            compBots[id].speed++; // Update speed
                            if (compBots[id].speed === 12) {
                                socket.emit('message', `\xa0` + compBots[id].username + " has reached MAX SPEED!"); // send msg to server
                            }
                        }
                        break;
                    case 'rangeUp':
                        if (compBots[id].bombSize < 15) { // MAX 12 BOMB RANGE
                            compBots[id].bombSize++; // Update number of bombs
                            if (compBots[id].bombSize === 12) {
                                socket.emit('message', `\xa0` + compBots[id].username + " has reached MAX RANGE!"); // send msg to server
                            }
                        }
                        break;
                }
                itemSound.volume = 0.1;
                itemSound.play();
                this.alive = false; // Mark the item as collected or no longer alive
            }
        }
    };
}
