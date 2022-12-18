import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { Vector3 } from '@dimforge/rapier3d-compat';
import { BaseOptions } from './Entity';
import Entity from './Entity';
import Stage from '../Stage';
import { AnimationClip } from 'three';
export declare class ActorLoader {
    fbxLoader: FBXLoader;
    object: THREE.Group | null;
    mixer: THREE.AnimationMixer | null;
    actions: THREE.AnimationAction[];
    animations: THREE.AnimationClip[] | null;
    constructor();
    loadFile(file: string): Promise<AnimationClip>;
    /**
     * load
     * loads fbx file paths for animating an actor entity
     * @param files
     */
    load(files: string[]): Promise<any>;
}
export default function Actor(options: ActorOptions): (target: any) => any;
export interface ActorOptions extends BaseOptions {
    files: Array<string>;
    position?: Vector3;
}
interface ActorInitialization {
    stage: Stage;
    payload: any;
}
export declare class PyramidActor extends Entity {
    object: THREE.Group;
    actions: THREE.AnimationAction[];
    currentAction?: THREE.AnimationAction;
    animationIndex: number;
    mixer: THREE.AnimationMixer;
    actorLoop?: Function;
    constructor({ stage, payload }: ActorInitialization);
    move(moveVector: Vector3): void;
    rotateInDirection(moveVector: Vector3): void;
    rotate(rotation: Vector3): void;
    rotateX(amount: number): void;
    rotateY(amount: number): void;
    rotateZ(amount: number): void;
    animate(animationIndex: number): void;
    update(delta: number): void;
}
export {};
