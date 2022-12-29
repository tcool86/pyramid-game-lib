import Entity from '../Entity';
import { CreatePrimitiveType, SphereOptions } from ".";
export declare function Sphere(options: Partial<SphereOptions>): (target: any) => void;
export declare function createSphere({ classInstance, parameters, stage }: CreatePrimitiveType): Entity;
