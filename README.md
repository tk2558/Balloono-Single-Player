# Balloono-Single-Player
Single Player Variation of the game Bomberman written in JavaScript, HTML, and CSS with client-server communication <br />
Recreation of the game Balloono from the website OMGPOP <br />
<br />

## How to Run

To run the Bomberman game on your local machine, follow these steps:

### Prerequisites

- Node.js installed on your system
- Git installed on your system

### Instructions

1. Clone the repository to your local machine using Git in Command Prompt with: git clone https://github.com/tk2558/Balloono-Single-Player
2. Navigate to the cloned repository in Command Prompt with: cd Balloono-Single-Player
3. Install all necessary dependencies in Command Prompt with: npm install express http socket.io
4. Start the server in Command Prompt with: npm start
 

## Gameplay: <br />
- Player control their character using arrows keys <br />
- Player can place a bomb/water balloon using space bar <br />
- Player wins when all bots have been defeated <br />
- Player loses if their character dies <br />
<br />
## Features:<br />
- Player enters their username to name their character <br />
- Game does not start until player hits the ready button and has entered a name <br />

- Player has three different stats...
  - Speed: Speed of character (Higher speed = faster action) <br />
  - Number of Bombs: Number of bombs player can place at a time before needing to wait for a bomb to denotate <br />
  - Range of Bomb: Number of spaces explosion of bomb will destroy horizontally and verticallyy<br />
  
- Power Ups have a chance of dropping after destroying breakable terrain (brown boxes)... <br />
  - There are 3 different power ups for each of the Player's stat <br />
  - Collecting one by going to its space will enhance one of Player's stats based on the Power Up <br />
  - Player stat increase will be reflected by the gauge under Player Profile and will be indicated with an audio cue <br />

- Terrarin that are unbreakable (trees, grass, gray squares) are preset but breakable terrarin (brown boxes) are randomly generated <br />

- Chat Box will display certain actions such as when a bot is defeated and by who <br />
- Players can also uses chat box to communicate to themselves <br />

- When player or bot are hit by a bomb/water balloon they are put into a vulnerable status where they can't move for 3 seconds <br />
- If player or bot is hit during this, they will be defeated <br />

### Start Screen:
![](https://github.com/tk2558/Balloono-Single-Player/blob/main/gameplay/Starting%20Gameplay.gif)
