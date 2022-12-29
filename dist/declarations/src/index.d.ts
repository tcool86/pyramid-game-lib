import Debug from './lib/Debug';
import Game from './lib/Game';
import Gamepad from './lib/Gamepad';
import Globals from './lib/Globals';
import Menu from './lib/Menu';
import Stage from './lib/Stage';
import { Actor, Collision, Box, Sphere } from './lib/Entities';
declare const Pyramid: {
    Debug: typeof Debug;
    Game: typeof Game;
    Gamepad: typeof Gamepad;
    Globals: typeof Globals;
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
    };
    Util: {
        Vector3: typeof import("./lib/Util").Vector3;
        Vector2: typeof import("./lib/Util").Vector2;
    };
};
export default Pyramid;
