// BALLOONO SINGLE PLAYER VERSION

const canvas = document.getElementById('game');
const context = canvas.getContext('2d');
const messageInput = document.getElementById('message-input');
const socket = io();

const grid = 64;
const numRows = 13;
const numCols = 15;

// create a new canvas and draw the soft wall image
const softWallCanvas = document.createElement('canvas');
const softWallCtx = softWallCanvas.getContext('2d');
softWallCanvas.width = softWallCanvas.height = grid;

// 1st layer
softWallCtx.fillStyle = '#fcbf37';
softWallCtx.fillRect(1, 1, grid, 16);

// 2nd layer
softWallCtx.fillStyle = '#f98418';
softWallCtx.fillRect(1, 17, grid, 16);

// 3rd layer
softWallCtx.fillStyle = '#fcbf37';
softWallCtx.fillRect(1, 33, grid, 16);

// 4th layer
softWallCtx.fillStyle = '#523412';
softWallCtx.fillRect(1, 47, grid, 16);

// Draw a black outline around the entire soft wall with rounded corners
softWallCtx.strokeStyle = 'black';
softWallCtx.lineWidth = 1;
softWallCtx.lineJoin = 'round';
softWallCtx.strokeRect(1, 1, grid - 2, grid - 2);

// create a new canvas and draw the unbreakable wall image.
const wallCanvas = document.createElement('canvas');
const wallCtx = wallCanvas.getContext('2d');
wallCanvas.width = wallCanvas.height = grid;

wallCtx.fillStyle = '#d2d2d2';
wallCtx.fillRect(0, 0, grid, grid - 1);
wallCtx.fillStyle = '#333333';
wallCtx.fillRect(0, 47, grid, grid - 1);


// Draw a black outline around the entire block with rounded corners
wallCtx.strokeStyle = 'black';
wallCtx.lineWidth = 1.5;
wallCtx.lineJoin = 'round';
wallCtx.strokeRect(0, 0, grid, grid - 1);

// create a new canvas and draw the bush image.
const bushCanvas = document.createElement('canvas');
const bushCtx = bushCanvas.getContext('2d');
bushCanvas.width = bushCanvas.height = grid;

// Create an Image object
const bushImage = new Image();
bushImage.src = 'img/grass.png'; // Set the source URL of the bush image

// Once the image is loaded, draw it on the canvas
bushImage.onload = function () {
    // Draw the bush image on the canvas
    bushCtx.drawImage(bushImage, 0, 0, grid, grid + 10);
};

// create a new canvas and draw the bush image.
const treeCanvas = document.createElement('canvas');
const treeCtx =  treeCanvas.getContext('2d');
treeCanvas.width = treeCanvas.height = grid;

// Create an Image object
const treeImage = new Image();
treeImage.src = 'img/tree.png'; // Set the source URL of the bush image


treeImage.onload = function () { // Once the image is loaded, draw it on the canvas
    // Draw the bush image on the canvas
    treeCtx.drawImage(treeImage, 0, 0, grid, grid);
};

const types = { // create a mapping of object types
    wall: '0', // Unbreakable Wall
    softWall: 1, // Breakable Wall
    bomb: 2, // Player drop bomb
    bush: '3', // bush background
    tree: '4', // tree background
    item: 5, // item drops
};

let entities = [];
let cells = [];
let gameState = true;
let endMSG = "";

const compBots = {};
const spawnLocations = [
    { row: 11, col: 13, id: "Bot1" }, // BOT RIGHT
    { row: 1, col: 13, id: "Bot2" }, // TOP RIGHT
    { row: 11, col: 1, id: "Bot3" }, // BOT LEFT
];

for (let num = 0; num < 3; num++) {
    compBots[num] = new Bot({
        row: spawnLocations[num].row,
        col: spawnLocations[num].col,
        bot_name: spawnLocations[num].id,
        bot_id: num,
    })
    entities.push(compBots[num]);
}

// Track every cell of the game using 2d array template
// '0' represents a wall
// 'x' represents a cell that cannot have a soft wall (player start zone)
const template = [
    ['4', '3', '3', '3', '3', '3', '3', '3', '3', '3', '3', '3', '3', '3', '4'],
    ['3', 'x', 'x', , , , , , , , , , 'x', 'x', '3'],
    ['3', 'x', '0', , '0', , '0', , '0', , '0', , '0', 'x', '3'],
    ['3', , , , , , , , , , , , , , '3'],
    ['3', , '0', , '0', , '0', , '0', , '0', , '0', , '3'],
    ['3', , , , , , , , , , , , , , '3'],
    ['3', , '0', , '0', , '0', , '0', , '0', , '0', , '3'],
    ['3', , , , , , , , , , , , , , '3'],
    ['3', , '0', , '0', , '0', , '0', , '0', , '0', , '3'],
    ['3', , , , , , , , , , , , , , '3'],
    ['3', 'x', '0', , '0', , '0', , '0', , '0', , '0', 'x', '3'],
    ['3', 'x', 'x', , , , , , , , , , 'x', 'x', '3'],
    ['4', '3', '3', '3', '3', '3', '3', '3', '3', '3', '3', '3', '3', '3', '4']
];

function drawCheckerboard() {
    const checkerSize = 64; // Size of each square in the checkerboard
    const numRows = Math.ceil(canvas.height / checkerSize);
    const numCols = Math.ceil(canvas.width / checkerSize);

    for (let row = 0; row < numRows; row++) {
        for (let col = 0; col < numCols; col++) {
            const isDarkSquare = (row + col) % 2 === 1;
            context.fillStyle = isDarkSquare ? '#22b100' : '#26c31a';
            context.fillRect(col * checkerSize, row * checkerSize, checkerSize, checkerSize);
        }
    }
}


function generateLevel() { // populate the level with walls and soft walls
    cells = [];
    for (let row = 0; row < numRows; row++) {
        cells[row] = [];
        for (let col = 0; col < numCols; col++) {
            if (!template[row][col] && Math.random() < 0.9) { cells[row][col] = types.softWall; } // 90% chance cell will be a soft wall
            else if (template[row][col] === types.wall) { cells[row][col] = types.wall; }
            else if (template[row][col] === types.bush) { cells[row][col] = types.bush; }
            else if (template[row][col] === types.tree) { cells[row][col] = types.tree; }
        }
    }
}

function sendMessage() { // Add a function to send player msgs
    const messageInput = document.getElementById('message-input');
    const message = messageInput.value;

    if (message.trim() !== '') { // message text input not empty
        socket.emit('message', `\xa0` + player.username + ": " + message); // send msg to server
        messageInput.value = ''; // reset message text input
    }
}

// game loop
let last;
let dt;

function loop(timestamp) {
    requestAnimationFrame(loop);
    if (gameState) {
        context.clearRect(0, 0, canvas.width, canvas.height);
        drawCheckerboard();

        // calculate the time difference since the last update
        if (!last) { // passes the current timestamp as a parameter to the loop
            last = timestamp;
        }

        dt = timestamp - last;
        last = timestamp;

        for (let row = 0; row < numRows; row++) { // update and render everything in the grid
            for (let col = 0; col < numCols; col++) {
                switch (cells[row][col]) {
                    case types.wall:
                        context.drawImage(wallCanvas, col * grid, row * grid);
                        break;
                    case types.softWall:
                        context.drawImage(softWallCanvas, col * grid, row * grid);
                        break;
                    case types.bush:
                        context.drawImage(bushCanvas, col * grid, row * grid);
                        break;
                    case types.tree:
                        context.drawImage(treeCanvas, col * grid, row * grid);
                        break;
                }
            }
        }

        entities.forEach((entity) => { // update and render all entities
            entity.update(dt);
            entity.render();

            if (entity instanceof Item && entity.gaugeId) { // Update gauge color if the entity is an item and has a corresponding gauge ID
                const gaugeUnit = document.getElementById(entity.gaugeId);
                if (gaugeUnit) {
                    gaugeUnit.classList.remove('gray'); // Remove gray class
                    gaugeUnit.classList.add('colored'); // Add colored class
                }
            }
        });

        entities = entities.filter((entity) => entity.alive); // remove dead entities
        player.render();
    }
    
    else {
        context.fillStyle = 'white';
        context.font = '40px Arial';
        context.fillText(endMSG, canvas.width / 2, canvas.height / 2 - 20);
    }
}

socket.on('message', (message) => {
    const chatOutput = document.getElementById('chat-output');
    const messageElement = document.createElement('div');

    messageElement.textContent = message;
    chatOutput.appendChild(messageElement);
    chatOutput.scrollTop = chatOutput.scrollHeight;
});

generateLevel();
requestAnimationFrame(loop);