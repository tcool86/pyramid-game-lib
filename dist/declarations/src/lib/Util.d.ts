import RAPIER from '@dimforge/rapier3d-compat';
import * as THREE from 'three';
export declare type Vector3Type = RAPIER.Vector3 | THREE.Vector3 | Vector3;
export declare class Vector3 extends THREE.Vector3 {
    x: number;
    y: number;
    z: number;
    constructor(x?: number, y?: number, z?: number);
}
export declare class Vector2 extends THREE.Vector2 {
    x: number;
    y: number;
    constructor(x?: number, y?: number);
}
declare const _default: {
    Vector3: typeof Vector3;
    Vector2: typeof Vector2;
};
export default _default;
