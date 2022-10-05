import Stage from '../Stage';
import { Vector3 } from '../Util';
import Entity, { BaseOptions } from './Entity';
/**
 * Functions for creating primitive geometries easily
 * easily create an object with collision and a texture
 *
 */
export interface TriggerEntity extends Entity {
    action?: Function;
    exitAction?: Function;
    enteredTrigger?: boolean;
}
export interface TriggerOptions extends BaseOptions {
    width?: number;
    height?: number;
    depth?: number;
    position?: Vector3;
    x?: number;
    y?: number;
    z?: number;
    action: Function;
    exitAction: Function;
}
export declare function createAreaTrigger(options: TriggerOptions, stage: Stage): TriggerEntity;
export declare function Triggers(stage: Stage): {
    createAreaTrigger: (options: TriggerOptions) => TriggerEntity;
};
