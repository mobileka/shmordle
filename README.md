Shmordle is a Wordle-like word guessing game.

<img src="./screenshot.png" width="400">

Shmordle is implemented using Deepseek V4 running in [OpenCode](https://opencode.ai).

I play a role of a product manager, explaining what I want, brainstorming with the model, and generating detailed specs before implementing them.

The project exists to experiment with new AI-development techniques, models and harnesses.

# How to Play

Clone, install the dependencies, start the server and open your browser.

```
npm install
npm run dev
```

and navigate to the URL you see in the output.

# Fun Facts and Observations

- The initial playable implementation cost me just $0.37.
- DeepSeek V4 is good at following instructions. I explained TDD to it, and the results have been surprisingly solid so far.
- As it's always the case with AI models, the quality of DeepSeek’s output drops as the context grows.
  - Deepseek's output quality drops significantly around 80–90k tokens and more.
  - Restarting the harness to clear the context window helps, but only until the codebase becomes large enough.
  - I tried [GitNexus](https://github.com/abhigyanpatwari/GitNexus?utm_source=chatgpt.com), but, like many AI-related libraries with tens of thousands of stars, it fails to deliver the most basic functionality it promises while shipping a ton of useless bells and whistles. Welcome to the age of AI slop.
  - I plan tryuing other ways to generate knowledge graphs

# License

[MIT](./LICENSE)
