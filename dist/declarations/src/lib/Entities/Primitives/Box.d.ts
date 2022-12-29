import Entity from '../Entity';
import { PrimitiveOptions } from '.';
import { CreationParameters } from '..';
export interface BoxOptions extends PrimitiveOptions {
    width: number;
    height: number;
    depth: number;
}
export declare function Box(options: Partial<BoxOptions>): (target: any) => void;
export declare function createBox({ classInstance, parameters, stage }: CreationParameters): Entity;
