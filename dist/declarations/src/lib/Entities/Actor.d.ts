import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { Vector3 } from '@dimforge/rapier3d-compat';
import { BaseOptions } from '.';
import Entity from './Entity';
import { PyramidStage } from '../Stage';
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
export declare function createActor({ classInstance, parameters, stage }: any): Promise<PyramidActor>;
export default function Actor(options: Partial<ActorOptions>): (target: any) => void;
export interface ActorOptions extends BaseOptions {
    files: Array<string>;
    position?: Vector3;
}
interface ActorInitialization {
    stage: PyramidStage;
    payload: any;
    tag: string;
}
export declare class PyramidActor extends Entity {
    object: THREE.Group;
    actions: THREE.AnimationAction[];
    currentAction?: THREE.AnimationAction;
    animationIndex: number;
    mixer: THREE.AnimationMixer;
    constructor({ stage, payload, tag }: ActorInitialization);
    move(moveVector: Vector3): void;
    rotateInDirection(moveVector: Vector3): void;
    rotate(rotation: Vector3): void;
    rotateX(amount: number): void;
    rotateY(amount: number): void;
    rotateZ(amount: number): void;
    animate(animationIndex: number): void;
    update({ delta, inputs }: {
        delta: number;
        inputs: any;
    }): void;
}
export {};
