import Entity from '../Entity';
import { PrimitiveOptions } from '.';
import { CreationParameters } from '..';
export interface BoxOptions extends PrimitiveOptions {
}
export declare function Box(options?: Partial<BoxOptions>): (target: any) => void;
export declare function createBox(params: CreationParameters): Entity;
