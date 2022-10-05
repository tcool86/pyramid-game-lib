import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { Vector3 } from '@dimforge/rapier3d-compat';
import Entity from './Entity';
import Stage from '../Stage';
export interface ActorPayload {
    object: THREE.Group;
    action: THREE.AnimationAction;
    mixer: THREE.AnimationMixer;
}
export declare class ActorLoader {
    fbxLoader: FBXLoader;
    constructor();
    /**
     * load
     * loads fbx file for animating an actor entity
     * @param file
     */
    load(file: string): Promise<ActorPayload>;
}
export default class Actor extends Entity {
    object: THREE.Group;
    animationActions: THREE.AnimationAction[];
    currentAction?: THREE.AnimationAction;
    mixer: THREE.AnimationMixer;
    constructor(stage: Stage, payload: ActorPayload);
    move(moveVector: Vector3): void;
    update(delta: number): void;
}
