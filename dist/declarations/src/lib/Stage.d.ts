import { Scene, Color, Vector2, WebGLRenderer } from 'three';
import { World, Collider } from '@dimforge/rapier3d-compat';
import Entity from './Entities/Entity';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { TriggerEntity } from './Entities/Triggers';
import { PyramidActor } from './Entities/Actor';
import { PyramidCamera } from './Camera';
export declare function Stage(options: {
    name: string;
    backgroundColor: Color;
}): (target: any) => (world: World) => PyramidStage;
export interface StageOptions {
    name: string;
    backgroundColor: Color;
}
export interface StageInterface {
    options: StageOptions;
    world: World;
    loop?: Function;
    setup?: Function;
}
export declare class PyramidStage {
    name: string;
    world: World;
    scene: Scene;
    _loop: Function;
    _setup: Function;
    screenResolution: Vector2;
    renderer: WebGLRenderer;
    composer: EffectComposer;
    _camera: PyramidCamera;
    colliders: Map<string, Entity>;
    intersectors: Map<string, Entity>;
    children: Map<string, Entity>;
    players: Map<string, PyramidActor>;
    constructor({ options, world, loop, setup }: StageInterface);
    setupRenderer(): void;
    setupLighting(scene: Scene): void;
    setupCamera(scene: Scene): void;
    addChild(id: string, child: any): void;
    update({ delta, inputs }: {
        delta: number;
        inputs: any;
    }): void;
    updateCollision(): void;
    getEntityFromCollider(collider: Collider): Entity | null;
    updateColliders(): void;
    isTrigger(entity: Entity): entity is TriggerEntity;
    /*******
      the idea behind area triggers and standard sensor based intersectors is that triggers
      built-in functionality for determining when an object enters and exits.
    ********/
    updateIntersectors(): void;
    render(): void;
    element(): HTMLCanvasElement;
}
