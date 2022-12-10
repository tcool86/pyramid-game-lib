import * as THREE from 'three';
import Stage from '../Stage';
import { Vector3, Vector2 } from '../Util';
import Entity, { BaseOptions } from './Entity';
/**
 * Functions for creating primitive geometries easily
 * easily create an object with collision and a texture
 *
 */
export interface PrimitiveOptions extends BaseOptions {
    material?: THREE.Material;
    texturePath?: string;
    textureSize?: Vector2;
    color?: number;
    width?: number;
    height?: number;
    depth?: number;
    size?: Vector3;
    radius?: number;
    position?: Vector3;
    isSensor?: boolean;
    x?: number;
    y?: number;
    z?: number;
    fixed?: boolean;
}
export declare function createBox(options: PrimitiveOptions, stage: Stage): Entity;
export declare function createSphere(options: PrimitiveOptions, stage: Stage): Entity;
export declare function Primitives(stage: Stage): {
    createBox: (options: PrimitiveOptions) => Entity;
    createSphere: (options: PrimitiveOptions) => Entity;
};
