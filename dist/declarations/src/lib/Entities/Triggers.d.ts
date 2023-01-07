import { Vector3 } from '../Util';
import { CreationParameters, BaseOptions } from '.';
import Entity from './Entity';
export interface TriggerEntity extends Entity {
    onEnter?: Function;
    onExit?: Function;
    hasEntered?: boolean;
}
export interface TriggerOptions extends BaseOptions {
    width?: number;
    height?: number;
    depth?: number;
    position?: Vector3;
    x?: number;
    y?: number;
    z?: number;
    onEnter: Function;
    onExit: Function;
    hasEntered: boolean;
}
export declare function Trigger(options: Partial<TriggerOptions>): (target: any) => void;
export declare function createAreaTrigger({ classInstance, parameters, stage }: CreationParameters): TriggerEntity;
