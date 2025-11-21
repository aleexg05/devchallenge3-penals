# Penalty Shootout Game

## Overview
This project is a basic penalty shootout game designed for two players, featuring real-time communication via WebSockets. Each player can choose their shot (height/direction) and save (height/direction). The scoring system awards points based on the outcome of each round, with automatic resets for new rounds.

## Project Structure
```
devchallenge3-penals
├── client
│   ├── index.html          # Main HTML file for the web application
│   ├── styles              # Contains CSS files for styling
│   │   ├── style.css       # Base styles for the application
│   │   ├── game.css        # Styles specific to the game interface
│   │   └── components.css   # Styles for reusable components
│   ├── scripts             # Contains JavaScript files for functionality
│   │   ├── app.js          # Initializes the application and manages game flow
│   │   ├── game.js         # Game logic and state management
│   │   ├── ui.js           # User interface management
│   │   └── websocket.js     # WebSocket connection handling
│   ├── assets              # Contains images and sounds used in the game
│   │   ├── images
│   │   │   ├── field.svg   # Penalty field image
│   │   │   ├── goal.svg    # Goal image
│   │   │   └── ball.svg    # Ball image
│   │   └── sounds
│   │       ├── kick.mp3    # Sound for kicking the ball
│   │       └── save.mp3    # Sound for a successful save
│   └── components          # Contains HTML structures for components
│       ├── scoreboard.html  # Scoreboard component
│       └── controls.html    # Controls component
├── server                  # Server-side application files
│   ├── server.js           # Entry point for the server
│   ├── ws.js               # WebSocket management
│   ├── gameManager.js      # Game state management
│   ├── test.js             # Testing file
│   ├── package.json        # Server-side dependencies and scripts
│   └── Dockerfile          # Docker instructions for the server
├── docker-compose.yml      # Docker Compose configuration
├── package.json            # Overall project dependencies and scripts
└── README.md               # Project documentation
```

## Setup Instructions
1. Clone the repository:
   ```
   git clone https://github.com/aleexg05/devchallenge3-penals.git
   cd devchallenge3-penals
   ```

2. Install dependencies:
   - For the server:
     ```
     cd server
     npm install
     ```
   - For the client (if applicable):
     ```
     cd client
     npm install
     ```

3. Run the application using Docker:
   ```
   docker-compose up
   ```

4. Access the game in your web browser at `http://localhost:3000`.

## Game Rules
- Each player takes turns to shoot and save.
- Players can choose the height and direction of their shots and saves.
- Points are awarded based on the outcome:
  - 0 points for a miss
  - 1 point for a successful shot or save
  - 2 points for a perfect shot or save
- The game automatically resets after each round.

Enjoy the game!