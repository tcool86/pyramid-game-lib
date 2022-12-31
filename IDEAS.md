# Ideas

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
