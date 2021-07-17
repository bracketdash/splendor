# Splendor MARVEL Bot

A bot built to learn how to play Splendor. I happened to have the MARVEL version, so coded to that.

## Browser App

Install some stuff:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Build and run the production app:

```bash
npm run build
npm run start
```

## Trainer (Node App)

Edit the all-caps constants in `src/scripts/trainer.js` to your liking, then:

```bash
npm run trainer
```

This is really just a script that tries every possible version of the bot and finds the best players among them. To play against one of the winners found during training, copy their weightset into `src/getOptionScore.js > const WEIGHTS` and run the Browser App.
