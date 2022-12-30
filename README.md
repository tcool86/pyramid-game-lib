# Pyramid Game Lib

A simple, easy-to-use library for 3D games and interactive media using the Vite build tool and TypeScript.

## Disclaimer

This is semi-actively being developed. Not all the features have been implemented and could change. Do *not* use this if you are looking for a high-performance game engine.

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

## Examples

All examples are a work in progress.

### Timbotron (Feature demo)

> Repository: <https://github.com/tcool86/timbotron>

> Live Demo: <https://vite-production-b29b.up.railway.app/>

### Sample Game (Basic)

> Repository: <https://github.com/tcool86/didactic-robot>

## Installation

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

const { Game, Util, Entity } = Pyramid;
const { Box, Sphere } = Entity;
const { Vector3, Vector2 } = Util;

@Box({
    fixed: true,
    color: 0xFFDEAD,
    width: 100,
    height: 0.2,
    depth: 100
})
export class Ground { }

@Sphere({
    color: 0x008080,
    position: new Vector3(3, 2, -3),
    radius: 1
})
export class SpecialBall {
    timer: number = 2;

    setup({ entity }: any) {
        console.log(`Entity: ${entity}`);
    }
    loop({ entity, delta }: any) {
        this.timer += delta;
        if (this.timer > 2) {
            entity.body.applyImpulse(new Vector3(0, 50, 0));
            this.timer = 0;
        }
    }
}

@Game(app)
class SampleGame {
    async setup({ commands }: any) {
        const { create } = await commands;
        create(Ground);
        create(SpecialBall);
    }

    loop({ inputs }: any) {
        const { horizontal, vertical, buttonA, buttonB } = inputs[0];
        if (buttonA) { console.log("A Pressed"); }
        if (buttonB) { console.log("B Pressed"); }
        if (horizontal) { console.log(`Horizontal: ${horizontal}`); }
        if (vertical) { console.log(`Vertical: ${vertical}`); }
    }

    ready() { }
}

new SampleGame();

```
