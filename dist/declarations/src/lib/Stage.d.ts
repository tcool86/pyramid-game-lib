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
    triggers: Map<string, TriggerEntity>;
    children: Map<string, Entity>;
    players: Map<string, PyramidActor>;
    constructor(world: RAPIER.World);
    addChild(id: string, child: any): void;
    update({ delta, inputs }: {
        delta: number;
        inputs: any;
    }): void;
    updateColliders(): void;
    updateIntersections(player: PyramidActor): void;
    render(): void;
    getPlayer(): PyramidActor | undefined;
}
