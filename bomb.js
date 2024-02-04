// Bomb Constructor Function
function Bomb(row, col, size, owner) {
    this.row = row;
    this.col = col;
    this.type = types.bomb;
    this.radius = grid * 0.4;
    this.size = size;    // the size of the explosion
    this.owner = owner;  // which player placed this bomb
    this.alive = true;

    // bomb blows up after 3 seconds
    dropSound.volume = 0.5;
    dropSound.play();
    this.timer = 2000;

    // update the bomb each frame
    this.update = function (dt) {
        this.timer -= dt;

        if (this.timer <= 0) { // blow up bomb if timer is done
            return blowUpBomb(this);
        }
        const interval = Math.ceil(this.timer / 500); // change the size of the bomb every half second
        if (interval % 2 === 0) { this.radius = grid * 0.45; }
        else { this.radius = grid * 0.5; }
    };

    // Render the bomb each frame
    this.render = function () {
        const x = (this.col + 0.5) * grid;
        const y = (this.row + 0.5) * grid;

        // Create a radial gradient for the water balloon
        const balloonGradient = context.createRadialGradient(x, y - (this.radius - 3), 0, x, y, this.radius - 3);
        balloonGradient.addColorStop(1, '#3498db'); // Inner color
        balloonGradient.addColorStop(0.3, '#1af3f3'); // Outer color

        // Draw the water balloon with radial gradient
        context.fillStyle = balloonGradient;
        context.beginPath();
        context.arc(x, y, this.radius - 3, 0, 2 * Math.PI);
        context.fill();

        // Add a small black outline around the balloon
        context.strokeStyle = 'black';
        context.lineWidth = 1;
        context.stroke();
    };
}

// Explosion constructor function
function Explosion(row, col, dir, center) {
    this.row = row;
    this.col = col;
    this.dir = dir;
    this.alive = true;

    // Add an image property to the Explosion entity
    this.image = new Image();
    this.image.src = 'img/pop.png';

    this.image.width = 140; // Set the width of the image
    this.image.height = 140; // Set the height of the image
    this.timer = 300; // show explosion for 0.3 seconds

    this.update = function (dt) { // update the explosion each frame
        this.timer -= dt;
        if (this.timer <= 0) { this.alive = false; }
    };

    this.render = function () { // render the explosion each frame
        const x = this.col * grid;
        const y = this.row * grid;
        const horizontal = this.dir.col;
        const vertical = this.dir.row;

        // create a explosion effect
        context.fillStyle = '#1d64a6';  // blue
        context.fillRect(x, y, grid, grid);
        context.fillStyle = '#209afc';  // medium blue

        // determine how to draw based on if it's vertical or horizontal
        if (center || horizontal) { context.fillRect(x, y + 6, grid, grid - 12); }
        if (center || vertical) { context.fillRect(x + 6, y, grid - 12, grid); }

        context.fillStyle = '#36fefb';  // light blue
        if (center || horizontal) { context.fillRect(x, y + 12, grid, grid - 24); }
        if (center || vertical) { context.fillRect(x + 12, y, grid - 24, grid); }

        if (center) {
            const imageX = x + (grid - this.image.width) / 2;
            const imageY = y + (grid - this.image.height) / 2;
            context.drawImage(this.image, imageX, imageY, this.image.width, this.image.height);
        }
    };
}


function blowUpBomb(bomb) { // Blow up a bomb and its surrounding tiles
    if (!bomb.alive) return;
    cells[bomb.row][bomb.col] = null; // Remove bomb from grid
    popSound.volume = 0.35;
    popSound.play();
    bomb.alive = false;

    const dirs = [ // Explode bomb outward by size
        { row: -1, col: 0 }, // Up
        { row: 1, col: 0 }, // Down
        { row: 0, col: -1 }, // Left
        { row: 0, col: 1 }, // Right
    ];

    dirs.forEach((dir) => {
        for (let i = 0; i < bomb.size - 1; i++) {
            const row = bomb.row + dir.row * i;
            const col = bomb.col + dir.col * i;
            const cell = cells[row][col];

            if (cell === types.wall || cell === types.bush) { // Stop the explosion if it hits a wall
                return;
            }

            // Center of the explosion is the first iteration of the loop
            entities.push(new Explosion(row, col, dir, i === 0 ? true : false));
            cells[row][col] = null;

            if (cell === types.bomb) { // Bomb hit another bomb so blow that one up too
                // Find the bomb that was hit by comparing positions
                const nextBomb = entities.find(
                    (entity) =>
                        entity.type === types.bomb && entity.row === row && entity.col === col
                );
                blowUpBomb(nextBomb);
            }
            if (cell === types.softWall && Math.random() < 0.27) { // 27% chance of dropping an item when a soft wall is destroyed
                const power = getRandomItem(); // get random item drop ['bombUp', 'speedUp', 'rangeUp']
                const item = new Item(row, col, power); // create item
                entities.push(item); // add item to entities
                cells[row][col] = null; // Cell is empty after destroying the soft wall
            }

            if (row === player.row && col === player.col) { // Player is hit by a bomb
                if (player.alive == 1) {
                    player.alive = 3;
                    player.image.src = 'img/bubble3.png';
                    hitSound.volume = 0.5;
                    hitSound.play();
                    playerTrapped();
                }
                else if (player.alive == 2) { // hit by bomb while trapped, player dies
                    player.alive = 0;
                    socket.emit('message', `\xa0` + player.username + " got popped by " + bomb.owner.username + "!"); // send msg to server
                }
            } 

            for (const id in compBots) { // BOTS
                if (row === compBots[id].row && col === compBots[id].col) { // Player is hit by a bomb
                    if (compBots[id].alive == 1) {
                        compBots[id].alive = 3;
                        compBots[id].image.src = 'img/bot3.png';
                        hitSound.volume = 0.4;
                        hitSound.play();
                        botTrapped(compBots[id]);
                    }
                    else if (compBots[id].alive == 2) { // hit by bomb while trapped, player dies
                        compBots[id].alive = 0;
                        socket.emit('message', `\xa0` + compBots[id].username + " got popped by " + bomb.owner.username + "!"); // send msg to server
                    }
                } 
            }
            if (cell) { // Stop the explosion if it hits anything
                return;
            }
        }
    });
    if (bomb.owner.is_bot) { bomb.owner.numBombs++; }
}