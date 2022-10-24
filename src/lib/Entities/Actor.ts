import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { Vector3, Rotation, RigidBodyType } from '@dimforge/rapier3d-compat';
import Entity from './Entity';
import Stage from '../Stage';
import { AnimationClip } from 'three';

export class ActorLoader {
	fbxLoader: FBXLoader;
	object: THREE.Group | null;
	mixer: THREE.AnimationMixer | null;
	actions: THREE.AnimationAction[];
	animations: THREE.AnimationClip[] | null;

	constructor() {
		this.fbxLoader = new FBXLoader();
		this.object = null;
		this.mixer = null;
		this.actions = [];
		this.animations = null;
	}

	loadFile(file: string): Promise<AnimationClip> {
		return new Promise((resolve, reject) => {
			return this.fbxLoader.load(
				file,
				(object) => {
					if (!this.object) {
						this.object = object;
					}
					if (!this.mixer) {
						this.mixer = new THREE.AnimationMixer(object);
					}
					const animation = (object as THREE.Object3D).animations[0];
					resolve(animation);
				},
				(xhr) => {
					console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
				},
				(error) => {
					console.error(error);
					reject(error);
				}
			)
		});
	}

	/**
	 * load
	 * loads fbx file paths for animating an actor entity
	 * @param files
	 */
	async load(files: string[]): Promise<any> {
		const promises = new Array();
		for (let file of files) {
			promises.push(this.loadFile(file));
		}
		const animations = await Promise.all(promises);
		this.animations = animations;
		for (let animation of this.animations) {
			if (this.mixer) {
				const action: THREE.AnimationAction = this.mixer?.clipAction(animation);
				this.actions.push(action);
			}
		}
		return this;
	}
}


export default class Actor extends Entity {
	object: THREE.Group;
	actions: THREE.AnimationAction[] = [];
	currentAction?: THREE.AnimationAction;
	animationIndex: number;
	mixer: THREE.AnimationMixer;

	constructor(stage: Stage, payload: any) {
		super(stage, 'player-test');
		const { actions, mixer, object } = payload;

		const position = object.position;
		this.createBody(position);

		const skinnedMesh = object.children[0] as THREE.SkinnedMesh;
		let geometry = skinnedMesh.geometry as THREE.BufferGeometry;
		this.collisionCustomGeometry(geometry);

		this.actions = actions;
		this.animationIndex = 0;
		this.currentAction = actions[0];
		this.mixer = mixer;
		this.object = object;

		this.currentAction?.play();
		this.object.scale.set(1, 1, 1);
		this.body.lockRotations(true, true);
		this.body.setAdditionalMass(100, true);
		this.body.setBodyType(RigidBodyType.KinematicVelocityBased);
		stage.scene.add(this.object);
		this.id = 'test-id';
		return this;
	}

	move(moveVector: Vector3) {
		// this.body.applyImpulse(moveVector, true);
		this.body.setLinvel(moveVector, true);
	}

	animate(animationIndex: number) {
		if (this.actions.length === 0) { return; }
		if (this.animationIndex === animationIndex) {
			return;
		}
		const previousIndex = this.animationIndex;
		this.currentAction = this.actions[animationIndex];
		this.currentAction.play();
		this.actions[previousIndex].stop();
		this.animationIndex = animationIndex;
	}

	update(delta: number) {
		super.update(delta);
		const translationVector: Vector3 = this.body.translation();
		const rotationVector: Rotation = this.body.rotation();
		this.object.position.set(translationVector.x, translationVector.y - 1, translationVector.z);
		this.object.rotation.set(rotationVector.x, rotationVector.y, rotationVector.z);
		if (this.showDebug) {
			// TODO: this is hacky, will all objects behave this way? Probably not...
			this.debug?.position.set(this.object.position.x - 2, this.object.position.y - 1, this.object.position.z);
			this.debug?.rotation.set(this.object.rotation.x, this.object.rotation.y, this.object.rotation.z);
		}
		this.mixer.update(delta);
	}
}
