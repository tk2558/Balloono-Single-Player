// Ready Up and start game
document.addEventListener("DOMContentLoaded", function () { // Get references to HTML elements
    const playerNameInput = document.getElementById("username");
    const readyButton = document.getElementById("readyButton");
    const playerNameDisplay = document.getElementById("playerName");
    const playerStatus = document.getElementById('playerImage');

    let start = false;
    let typing = false;
    let lastMoveTime = 0;

    readyButton.addEventListener("click", function () { // Add click event listener to the "Ready" button
        if (!start) {
            const playerName = playerNameInput.value;
            playerNameDisplay.textContent = playerName;
            player.username = playerName;

            readyButton.style.backgroundColor = "#4CAF50";
            playerStatus.src = "img/ready.png";
            readyButton.disabled = true; // make button clickable once

            playerNameInput.disabled = true; // make text input clickable once
            start = true;
            socket.emit('message', `\xa0` + player.username + " is ready!"); // send msg to server

            for (const id in compBots) { // ACTIVATE THE BOTS
                compBots[id].alive = 1;
            }

            document.getElementById("message-input").disabled = false;
            document.addEventListener("keydown", handleMovement);
            document.addEventListener("keydown", handleBombs);
        }
    });

    messageInput.addEventListener('focus', function () {
        typing = true;
        messageInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    });

    messageInput.addEventListener('blur', function () {
        typing = false;
    });

    function handleMovement(e) { // listen to keyboard events to move
        if (!player.alive || player.alive === 2 || player.alive === 3 || typing) { return; }
        const currentTime = Date.now();
        if (currentTime - lastMoveTime < 120) { // at least 120 ms delay
            return;
        }

        let row = player.row;
        let col = player.col;

        lastMoveTime = currentTime;
        const movementDelay = 120 / player.speed;

        if (e.which === 37) { col--; } // left arrow key
        else if (e.which === 38) { row--; } // up arrow key
        else if (e.which === 39) { col++; } // right arrow key
        else if (e.which === 40) { row++; } // down arrow key


        setTimeout(() => { // Set a timeout to handle the movement after the calculated delay
            if (!cells[row][col]) { // don't move the player if something is already at that position
                player.row = row;
                player.col = col;
            }
        }, movementDelay);
    }

    function handleBombs(e) {  // listen to keyboard events to place bomb
        if (!player.alive || player.alive === 2 || typing) { return; }
        if (e.which === 32 && !cells[player.row][player.col] && entities.filter((entity) => entity.type === types.bomb && entity.owner === player).length < player.numBombs) {
            const bomb = new Bomb(player.row, player.col, player.bombSize, player); // create bomb
            entities.push(bomb); // add bomb to entities
            cells[player.row][player.col] = types.bomb; // place bomb
        }
    }
});