import { Vector2, Camera, Object3D } from 'three';
import { Entity } from './Entities';
export declare class PyramidCamera {
    cameraRig: Object3D;
    camera: Camera;
    follow: Entity | null;
    constructor(screenResolution: Vector2);
    update(): void;
    moveFollowCamera(): void;
    followEntity(entity: Entity): void;
}
