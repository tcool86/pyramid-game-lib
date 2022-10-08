# Pyramid Game Lib

A simple, easy-to-use library for RAD (rapid application development) game development using the Vite build tool and TypeScript.

## Disclaimer

This is actively being developed as of October 7th, 2022. Not all the features have been implemented and could change. Do *not* use this if you are looking for a high-performance game engine.

### Why Pyramid Game Lib?

I wanted to build something easy to jump into and deploy while still only writing code (no complex game IDE).

### Who should use this?

This library is intended for hobbyist developers who want to play with 3D web technologies to build a game.

### What does this do?

The goal is to give you tools to build simple 3D games. It's basically comprised of:

- User input (game controllers)
- Collision handling, triggers, and rigid body physics via RapierRS (<https://rapier.rs/>)
- Game state via StateShot that can be serialized and sent to a server. (<https://github.com/gaoding-inc/stateshot>)
- Rendering via ThreeJS with some capability to handle postprocessing built-in. (<https://threejs.org/>)

### Where can I deploy?

The easiest way to deploy is via Railway with Vite-TypeScript template: <https://github.com/NotConspicuous/Vite-Typescript-Railway-Template>

### Installation

```yarn add 'pyramid-game-lib'```

Within the `index.html` file you will need an element to populate the game (in this example a div with an "app" id: `<div id="app"></div>`):

```html
<body>
    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
</body>
```

Within the `main.ts` file:

```typescript
import Pyramid from 'pyramid-game-lib';

const app = document.querySelector<HTMLDivElement>('#app')!;
const { Game, Util } = Pyramid;
const { Vector3 } = Util;

const game = new Game({
    setup: async ({ primitives, materials, triggers, loaders }: any) => {
        const { createBox, createSphere } = primitives;
        const { createAreaTrigger } = triggers;
        // Box
        createBox({
            debugColor: 0xBADA55,
            showDebug: true,
            position: new Vector3(-3, 0.5, 3),
            width: 2,
            height: 2,
            depth: 2
        });
    },
    loop: ({ inputs, player }: any) => {
        const { horizontal, vertical, buttonA, buttonB } = inputs[0];
        if (buttonA) { console.log("A Pressed"); }
        if (buttonB) { console.log("B Pressed"); }
        if (horizontal) { console.log(`Horizontal: ${horizontal}`); }
        if (vertical) { console.log(`Vertical: ${vertical}`); }
    }
});
game.ready.then(() => {
    app.appendChild(game.domElement());
});
```
