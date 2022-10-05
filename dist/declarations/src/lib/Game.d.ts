import RAPIER from '@dimforge/rapier3d-compat';
import Stage from './Stage';
import { Menu } from './Menu';
import Entity from './Entities/Entity';
import { PrimitiveOptions } from './Entities/Primitives';
import { TriggerOptions, TriggerEntity } from './Entities/Triggers';
import { ActorOptions } from './Entities/Loaders';
import Actor from './Entities/Actor';
import Gamepad, { ControllerInput } from './Gamepad';
import { Clock } from 'three';
export interface LoopInterface {
    ticks: number;
    inputs: ControllerInput[];
    player: Actor;
    stage: Stage;
}
export interface SetupInterface {
    primitives: {
        createBox(options: PrimitiveOptions): Entity;
        createSphere(options: PrimitiveOptions): Entity;
    };
    triggers: {
        createAreaTrigger(options: TriggerOptions): TriggerEntity;
    };
    loaders: {
        createActor(options: ActorOptions): Actor;
    };
    materials: {
        metal: THREE.Material;
    };
}
interface GameOptions {
    loop: ({}: LoopInterface) => void;
    setup: ({}: SetupInterface) => void;
}
declare class Game {
    stages: Stage[];
    currentStage: number;
    menu?: Menu;
    loop: Function;
    setup: Function;
    gamepad: Gamepad;
    clock: Clock;
    ready: Promise<boolean>;
    constructor({ loop, setup }: GameOptions);
    loadPhysics(): Promise<RAPIER.World>;
    /**
     * Main game loop
     * process user input
     * update physics
     * render scene
     */
    gameLoop(self: Game): Promise<void>;
    gameSetup(): Promise<void>;
    stage(): Stage;
    domElement(): HTMLCanvasElement;
}
export default Game;
