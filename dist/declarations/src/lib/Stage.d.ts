import RAPIER from '@dimforge/rapier3d-compat';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import Entity from './Entities/Entity';
import { TriggerEntity } from './Entities/Triggers';
import { PyramidActor } from './Entities/Actor';
export default class Stage {
    world: RAPIER.World;
    scene: THREE.Scene;
    renderer: THREE.WebGLRenderer;
    composer: EffectComposer;
    colliders: Map<string, Entity>;
    intersectors: Map<string, Entity>;
    children: Map<string, Entity>;
    players: Map<string, PyramidActor>;
    constructor(world: RAPIER.World);
    addChild(id: string, child: any): void;
    update({ delta, inputs }: {
        delta: number;
        inputs: any;
    }): void;
    updateCollision(): void;
    getEntityFromCollider(collider: RAPIER.Collider): Entity | null;
    updateColliders(): void;
    isTrigger(entity: Entity): entity is TriggerEntity;
    /*******
      the idea behind area triggers and standard sensor based intersectors is that triggers
      built-in functionality for determining when an object enters and exits.
    ********/
    updateIntersectors(): void;
    render(): void;
}
