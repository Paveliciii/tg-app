# Telegram Clicker Game

A simple clicker game built as a Telegram Mini App using React and Vite.

## Features

- Click to earn points
- Upgrade click power
- Buy auto-clickers
- Local storage for game progress
- Telegram WebApp integration
- Responsive design with Tailwind CSS

## Local Development

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. To test the app locally:
   - Open Telegram
   - Find @BotFather
   - Create a new bot if you don't have one
   - Use the command `/newapp`
   - Follow the instructions to create a new Mini App
   - For local testing, you can use a service like ngrok to create a public URL for your local server

## Building for Production

1. Build the app:
```bash
npm run build
```

2. The built files will be in the `dist` directory

## Deploying to Telegram

1. Host your built files on a web server (e.g., GitHub Pages, Netlify, Vercel)
2. In Telegram, find @BotFather
3. Use the command `/myapps`
4. Select your bot
5. Choose "Edit Mini App"
6. Update the URL to point to your hosted app
7. Make sure your bot has the `web_app` scope enabled

## Game Mechanics

- Click the main button to earn points
- Use points to upgrade your click power
- Buy auto-clickers to earn points automatically
- Your progress is saved locally
- Click "Finish Game" to send your results to the bot

## Technologies Used

- React
- TypeScript
- Vite
- Tailwind CSS
- Telegram WebApp SDK
