import { Vector2, Camera } from 'three';
import { Entity } from './Entities';
export declare class PyramidCamera {
    camera: Camera;
    follow: Entity | null;
    constructor(screenResolution: Vector2);
    update(): void;
    moveFollowCamera(): void;
    followEntity(entity: Entity): void;
}
