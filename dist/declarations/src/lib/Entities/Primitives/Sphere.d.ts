import Entity from '../Entity';
import { PrimitiveOptions } from ".";
import { CreationParameters } from '..';
export interface SphereOptions extends PrimitiveOptions {
    radius: number;
}
export declare function Sphere(options: Partial<SphereOptions>): (target: any) => void;
export declare function createSphere({ classInstance, parameters, stage }: CreationParameters): Entity;
