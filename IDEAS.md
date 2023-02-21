# Ideas

## What does a pyramid entity implement?

What I want it to do

- Entities should have a loop that they can use to perform updates
  - Get and set properties on the entity
  - Get and set game objects
    - stages
    - commands (create, delete)
    - camera
  - Get and set global properties (STATE)
  - Get and set scene objects (THREE)
  - Get and set world objects (RAPIER)
  - Get and set audio objects
  - Get and set input objects

> Basically the dev will have access to everything. I don't know if there's a way around this that would offer the same DX. For collision functions, I'm restricting the dev to alter global and world state, but not allowing access to other objects. Will this enforce cleaner code?

```typescript
// Psuedo interface
interface EntityGameInterface { self, stage, commands, camera, globals, scene, world, audio, input }
```

```typescript

interface PyramidGameEntity {
 loop: Partial<EntityGameInterface>;
 setup: Partial<EntityGameInterface>;
}

interface PyramidGameCollision {
 collision: { self, target, globals, world }
}

function sampleLoop({ self, input, audio, spawn, frame }) {
    const playerOneInput = input.player.get(1);
    const playerOneAudio = audio.player.get(1);
    const { buttonA, buttonB } = playerOneInput;
    if (buttonA) {
        shoot({ playerOneAudio, self, spawn, frame });
    }
}

function shoot({ playerOneAudio, self, spawn, frame }) {
    frame(1, () => {
        playerOneAudio.play('fire', { ...options });
        self.animate('shoot');
        spawn(Projectile);
    });
}

```

```typescript
async setup({ create }) {
 // get instance after attached to stage:
 const box = create(MyBox);
 // alter instance value after attached to stage
 box.property = 'new value';
}
```

## Decorators

### Main Game loop

```typescript
import { Game, Stage, Entity, GameLoaders } from 'pyramid-game-lib';

@Game(HTMLElement)
class Main {

    loop() {
        const { p1 } = this.input;
        const player1 = this.getPlayer1();
        // etc
    }
}

@Entity({
 type: Entity.Box
})
class MyBox {

    loop(ticks: number) {
        this.rotateX(ticks/1000);
    }

    @Collision('player')
    destroyBox({ destroy }) {
        destroy(this);
    }
}

@Actor({
 animations: [idle, walk, shoot]
})
class MyPlayer {

    loop({ input }) {
        const { p1 } = input;

        const movement = new Vector3(); // Is this necessary?
        // should the developer be concerned with vector creation?

        // should we alter a temporary vector from within the actor
        if (p1.vertical > 0.5) {
            this.moveX(5);
        }else if (p1.vertical < 0.5) {
            this.moveX(-5);
        }
        // then use the temp vector for direction?
        this.rotateInDirection();
    }
}

```

## Old Sample

```typescript
    import { Game, Stage, Entity, MapLoader } from 'pyramid';

    const stage = new Stage({
        ...options
    });

    const entity = new Entity({
        ...options
    });

    stage.add(entity);

    Game.loop(({ input, stages, entities }) => {
        const { p1 } = input;
        const playerEntity = entities.getPlayer1();
        if (p1.up > 0.5) {
            playerEntity.moveX(5);
        }else if (p1.down > 0.5) {
            playerEntity.moveX(-5);
        }
    });

    playerEntity.collision('spike', ({entity, spike}) => {
        
    })

```
