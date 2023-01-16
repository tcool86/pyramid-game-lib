import { PyramidStage } from "../Stage";
import { Vector3 } from '../Util';
import RAPIER from '@dimforge/rapier3d-compat';
import * as THREE from 'three';
import { BufferGeometry, Vector2 } from "three";
export interface EntityBuilder {
    rectangularMesh(size: Vector3, position: Vector3): void;
    sphericalMesh(radius: number, position: Vector3): void;
    noMesh(): void;
    createBody(position: Vector3): void;
    collisionRectangular(size: Vector3): void;
    collisionSpherical(radius: number): void;
    collisionStatic(): void;
    setRotation(x: number, y: number, z: number): void;
    applyMaterial(texturePath: string | null, color: number, repeat: Vector2): void;
}
export declare function pixelTexture(texture: THREE.Texture): THREE.Texture;
export default class Entity implements EntityBuilder {
    id: string;
    material?: THREE.Material;
    geometry?: THREE.BoxGeometry | THREE.SphereGeometry;
    mesh?: THREE.Mesh;
    body: RAPIER.RigidBody;
    debug: THREE.Mesh | null;
    debugColor: THREE.ColorRepresentation;
    showDebug: boolean;
    collisionKey?: string;
    isSensor: boolean;
    stageRef: PyramidStage;
    tag: string;
    _frames: Map<string, any>;
    _loop?: Function;
    _setup?: Function;
    _ref: any;
    static instanceCounter: number;
    constructor(stage: PyramidStage, tag: string);
    rectangularMesh(size: Vector3, position: Vector3): void;
    sphericalMesh(radius: number, position: Vector3): void;
    noMesh(): void;
    createDebugMesh(geometry: BufferGeometry, position: Vector3, color?: number): void;
    createBody(position: Vector3): void;
    collisionRectangular(size: Vector3, isSensor?: boolean): void;
    collisionSpherical(radius: number, isSensor?: boolean): void;
    collisionCustomGeometry(geometry: THREE.BufferGeometry): void;
    collisionStatic(): void;
    setRotation(x?: number, y?: number, z?: number): void;
    rotateX(amount: number): void;
    rotateY(amount: number): void;
    rotateZ(amount: number): void;
    angularVelocity(vector: Vector3): void;
    applyMaterial(texturePath: string | null, color: number, repeat: Vector2): void;
    update({ delta, inputs }: {
        delta: number;
        inputs: any;
    }): void;
}
