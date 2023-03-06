import Debug from './lib/Debug';
import Game, { PyramidGameEntity } from './lib/Game';
import Gamepad from './lib/Gamepad';
import Menu from './lib/Menu';
import { Stage } from './lib/Stage';
import { Actor, Collision, Box, Sphere, Trigger } from './lib/Entities';
export type { PyramidGameEntity as GameEntity };
declare const Pyramid: {
    Debug: typeof Debug;
    Game: typeof Game;
    Gamepad: typeof Gamepad;
    Globals: import("./lib/Globals").default;
    updateGlobals: (state: import("./lib/Globals").GameState) => void;
    setGlobals: (state: import("./lib/Globals").GameState) => void;
    Menu: typeof Menu;
    Stage: typeof Stage;
    Entity: {
        Actor: typeof Actor;
        Collision: typeof Collision;
        Materials: {
            metal: import("three").Material;
        };
        Box: typeof Box;
        Sphere: typeof Sphere;
        Trigger: typeof Trigger;
    };
    Util: {
        Vector3: typeof import("./lib/Util").Vector3;
        Vector2: typeof import("./lib/Util").Vector2;
    };
};
export default Pyramid;
