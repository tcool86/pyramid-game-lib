import RAPIER from '@dimforge/rapier3d-compat';
import { PyramidStage } from './Stage';
import Menu from './Menu';
import Gamepad, { ControllerInput } from './Gamepad';
import { Clock } from 'three';
import Globals from './Globals';
import { Entity } from './Entities';
import { PyramidCamera } from './Camera';
import { PyramidActor } from './Entities/Actor';
import { TriggerEntity } from './Entities/Triggers';
interface GameOptions {
    loop: (params: PyramidParamsBase<PyramidGame>) => void;
    setup: (params: PyramidParamsBase<PyramidGame>) => void;
    globals: Globals;
    stages: Function[];
}
export interface PyramidParamsBase<T> {
    ticks: number;
    frame: (timer: number, callback: Function) => void;
    game: PyramidGame;
    stage: PyramidStage;
    camera: PyramidCamera;
    globals: Globals;
    scene: THREE.Scene;
    world: RAPIER.World;
    audio: unknown;
    inputs: ControllerInput[];
    create: Function;
    entity: T;
}
export declare type GameParams = PyramidParamsBase<Entity>;
export declare type GameTrigger = PyramidGameEntity<TriggerEntity>;
export declare type GameActor = PyramidGameEntity<PyramidActor>;
export interface PyramidGameEntity<T> {
    loop: (params: PyramidParamsBase<T>) => void;
    setup: (params: PyramidParamsBase<T>) => void;
}
declare function Game({ app, stages }: {
    app: HTMLElement | string;
    stages?: Function[];
}): (target: any) => void;
export declare class PyramidGame {
    stages: PyramidStage[];
    currentStage: number;
    menu?: Menu;
    _globals: Globals;
    _loop: Function;
    _setup: Function;
    _stages: any[];
    gamepad: Gamepad;
    pause: boolean;
    clock: Clock;
    ready: Promise<boolean>;
    constructor({ loop, setup, globals, stages }: GameOptions);
    loadPhysics(): Promise<RAPIER.World>;
    /**
     * Main game loop
     * process user input
     * update physics
     * render scene
     */
    gameLoop(self: PyramidGame): Promise<void>;
    gameSetup(): Promise<void>;
    stage(): PyramidStage;
    domElement(): HTMLCanvasElement;
}
export default Game;
