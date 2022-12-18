import Stage from './Stage';
import Entity from './Entities/Entity';
import { PrimitiveOptions } from './Entities/Primitives';
import { TriggerOptions, TriggerEntity } from './Entities/Triggers';
import { ControllerInput } from './Gamepad';
export interface LoopInterface {
    ticks: number;
    inputs: ControllerInput[];
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
    materials: {
        metal: THREE.Material;
    };
}
declare function Game(app: HTMLElement): (target: any) => void;
export default Game;
