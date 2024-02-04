/*
IMPLEMENTING BOT LOGIC
*/
const preset_moves = [
    { moves: [2, 0, 4, 2, 3, 3] }, // BOT1: STAY, UP, BOMB, DOWN, LEFT (STAY FOR 2 SECONDS)
    { moves: [1, 3, 4, 1, 2, 2] }, // BOT2: STAY, LEFT, BOMB, RIGHT, DOWN (STAY FOR 2 SECONDS)
    { moves: [2, 0, 4, 2, 1, 1] }, // BOT3: STAY, UP, BOMB, DOWN, RIGHT (STAY FOR 2 SECONDS)
]

class Bot {
    constructor({ row, col, bot_name, bot_id }) {
        this.row = row; // Spawn coordinates (x) 
        this.col = col; // Spawn coordinates (y)

        this.numBombs = 1; // default one bomb
        this.speed = 1; // default speed
        this.bombSize = 3; // default bomb size

        this.image = new Image(); // player model
        this.image.src = 'img/bot.png'; // player model src
        this.username = bot_name; // player username
        this.id = bot_id; // player username
        this.is_bot = true;

        this.alive = 4; // player status: 0 = dead, 1 = alive, 2 = trapped, 3 = brief moment of invincibility
        this.premoves = preset_moves[bot_id].moves;
        this.move_counter = 0;
        this.lastMove = 5;

        // BOT TIMERS TO KEEP TRACK OF
        this.trappedTimer = 0;
        this.updateDelay = 640 / this.speed;
        //this.updateDelay = 700 - (50 * (this.speed - 1)); 
        this.lastUpdate = Date.now();
    }

    render() {
        const x = this.col * grid;
        const y = this.row * grid;
        context.drawImage(this.image, x, y, grid, grid);

        // Draw the name tag
        context.fillStyle = 'white';
        context.font = '14px Arial';
        context.textAlign = 'center';
        context.fillText(this.username, x + grid / 2, y - 8);
    }

    update() {
        if (this.alive === 1) {
            const currentTime = Date.now();
            if (currentTime - this.lastUpdate >= this.updateDelay) {
                this.lastUpdate = currentTime;
                let Bot_row = this.row;
                let Bot_col = this.col;
                let direction;

                if (this.move_counter < this.premoves.length) {
                    direction = this.premoves[this.move_counter];
                    this.move_counter++;
                }
                else {
                    const nextDir = getDirection(this.row, this.col, this.lastMove);
                    if (((nextDir.length < 1 && nearSoftWall(this.row, this.col)) || botATK(this)) && (this.numBombs != 0) && (cells[Bot_row][Bot_col] != types.bomb) && (this.lastMove != 4)) {
                        direction = 4;
                    }
                    else { direction = nextDir[Math.floor(Math.random() * nextDir.length)]; }
                }
                if (this.alive === 1) {
                    switch (direction) {
                        case 0: // Up
                            Bot_row--;
                            break;
                        case 1: // Right
                            Bot_col++;
                            break;
                        case 2: // Down
                            Bot_row++;
                            break;
                        case 3: // Left
                            Bot_col--;
                            break;
                        case 4: // Place Bomb
                            //console.log(this.username + ":\nNum Bombs: " + this.numBombs + "\nSpeed: " + this.speed + "\nRange: " + this.bombSize);
                            const bot_bomb = new Bomb(this.row, this.col, this.bombSize, this); // Create bomb
                            entities.push(bot_bomb); // add bomb to entities
                            cells[this.row][this.col] = types.bomb; // place bomb
                            this.numBombs -= 1;
                            break;
                    }

                    this.lastMove = direction;
                    if (!cells[Bot_row][Bot_col]) {
                        this.row = Bot_row;
                        this.col = Bot_col;
                    }
                }
            }
        }
    }
}

function botTrapped(victim) {
    setTimeout(() => { victim.alive = 2; }, 250); // 250 ms of invincibility;
    const deathImages = ['img/bot2.png', 'img/bot1.png'];
    let imageIdx = 0;
    let volumeCD = .3; // volume countdown

    const deathInterval = setInterval(() => {
        if (victim.alive === 0) {
            deathSound.volume = 0.3; // death sound play
            deathSound.play();
            allBotDied();
            clearInterval(deathInterval);
            return;
        }
        
        if (imageIdx < deathImages.length) {
            victim.alive = 2;
            victim.image.src = deathImages[imageIdx];
            hitSound.volume = volumeCD;
            hitSound.play();
            imageIdx++;
            volumeCD -= .05;
        }
        else {
            clearInterval(deathInterval);
            imageIdx = 0;
            victim.alive = 1; // player alive again
            victim.image.src = 'img/bot.png';
            releaseSound.volume = 0.3;
            releaseSound.play();
        }
    }, 1000);
}

function getDirection(row, col, lastMove) { // GET ALL POSSIBLE MOVES
    possibleMoves = [];
    let Bot_row = row;
    let Bot_col = col;

    if ((!cells[Bot_row - 1][Bot_col]) && (lastMove != 2)) { // && cells[Bot_row - 1][Bot_col] != types.bomb) { // CAN GO UP
        possibleMoves.push(0);
    }
    if ((!cells[Bot_row][Bot_col + 1]) && (lastMove != 3)) { // && cells[Bot_row][Bot_col + 1] != types.bomb) { // CAN GO RIGHT
        possibleMoves.push(1);
    }
    if ((!cells[Bot_row + 1][Bot_col]) && (lastMove != 0)) { // && cells[Bot_row + 1][Bot_col] != types.bomb) { // CAN GO DOWN
        possibleMoves.push(2);
    }
    if ((!cells[Bot_row][Bot_col - 1]) && (lastMove != 1)) { // && cells[Bot_row][Bot_col - 1] != types.bomb) { // CAN GO LEFT
        possibleMoves.push(3);
    }
    return possibleMoves;
}

// return true if in range, otherwise false
function inRange(x, min, max) {
    return ((x - min) * (x - max) <= 0);
}

function checkWall_LR(row, col) { // WALL TO THE LEFT OR RIGHT
    return (cells[row + 1][col] == types.wall || cells[row - 1][col] == types.wall);
}

function checkWall_AB(row, col) { // WALL TO ABOVE OR BELOW
    return (cells[row][col + 1] == types.wall || cells[row][col - 1] == types.wall);
}

function nearSoftWall(row, col) { // WALL TO ABOVE OR BELOW
    return ((cells[row + 1][col] == types.softWall) || (cells[row - 1][col] == types.softWall) || (cells[row][col + 1] == types.softWall) || (cells[row][col - 1] == types.softWall));
}


function botATK(fighter) {
    const wall_LR = checkWall_LR(fighter.row, fighter.col);
    const wall_AB = checkWall_AB(fighter.row, fighter.col);

    const row_min = fighter.row - (fighter.bombSize - 2);
    const col_min = fighter.col - (fighter.bombSize - 2);
    const row_max = fighter.row + (fighter.bombSize - 2);
    const col_max = fighter.col + (fighter.bombSize - 2);

    if ((player.col == fighter.col) && !wall_LR) { // CHECK BOMB IN RANGE OF PLAYER (ROW)
        if (inRange(player.row, row_min, row_max)) {
            return true;
        }
    }

    if ((player.row == fighter.row) && !wall_AB) { // CHECK BOMB IN RANGE OF PLAYER (COL)
        if (inRange(player.col, col_min, col_max)) {
            return true;
        }
    }

    for (const id in compBots) { // BOTS
        if (compBots[id].username != fighter.username) {
            if ((compBots[id].col == fighter.col) && !wall_LR) { // CHECK BOMB IN RANGE OF ANOTHER BOT (ROW)
                if (inRange(compBots[id].row, row_min, row_max)) {
                    return true;
                }
            }
            if ((compBots[id].row == fighter.row) && !wall_AB) { // CHECK BOMB IN RANGE OF ANOTHER BOT (COL)
                if (inRange(compBots[id].col, row_min, row_max)) {
                    return true;
                }
            }
        }
    }
    return false;
}

function allBotDied() {
    if (compBots[0].alive === 0 && compBots[1].alive === 0 && compBots[2].alive === 0) {
        setTimeout(() => {
            socket.emit('message', "YOU WON! REFRESH TO PLAY AGAIN"); // send msg to server
            endMSG = "YOU WIN";
            gameState = false;
        }, 550);
    }
}