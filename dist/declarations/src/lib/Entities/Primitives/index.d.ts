import { Material } from 'three';
import { Vector3, Vector2 } from '../../Util';
import { BaseOptions } from '..';
export { Box, createBox } from './Box';
export { Sphere, createSphere } from './Sphere';
export interface PrimitiveOptions extends BaseOptions {
    x?: number;
    y?: number;
    z?: number;
    position: Vector3;
    size?: Vector3;
    texturePath: string | null;
    textureSize: Vector2;
    color: number;
    material?: Material;
    isSensor?: boolean;
    fixed?: boolean;
    glow?: boolean;
}
