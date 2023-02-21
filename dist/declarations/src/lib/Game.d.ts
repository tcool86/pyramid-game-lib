import RAPIER from '@dimforge/rapier3d-compat';
import { PyramidStage } from './Stage';
import { ControllerInput } from './Gamepad';
import Globals from './Globals';
import { Entity } from './Entities';
import { Frame } from './Entities/Frame';
export interface BaseGameEntityInterface {
    ticks: number;
    frame: Frame;
    entity: Entity;
    stage: PyramidStage;
    camera: unknown;
    globals: Globals;
    scene: THREE.Scene;
    world: RAPIER.World;
    audio: unknown;
    inputs: ControllerInput[];
}
export interface LoopInterface extends BaseGameEntityInterface {
    spawn: unknown;
}
export interface SetupInterface extends BaseGameEntityInterface {
    commands: {
        create: Function;
    };
}
export interface PyramidGameEntity {
    loop: (params: Partial<LoopInterface>) => void;
    setup: (params: Partial<SetupInterface>) => void;
}
declare function Game({ app, stages }: {
    app: HTMLElement | string;
    stages?: Function[];
}): (target: any) => void;
export default Game;
