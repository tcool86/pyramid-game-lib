import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { Vector3, Rotation, RigidBodyType } from '@dimforge/rapier3d-compat';
import Entity from './Entity';
import Stage from '../Stage';

export interface ActorPayload {
	object: THREE.Group;
	action: THREE.AnimationAction;
	mixer: THREE.AnimationMixer;
}

export class ActorLoader {
	fbxLoader: FBXLoader;

	constructor() {
		this.fbxLoader = new FBXLoader();
	}

	/**
	 * load
	 * loads fbx file for animating an actor entity
	 * @param file
	 */
	load(file: string): Promise<ActorPayload> {
		console.log(`${file} currently unused`);
		return new Promise((resolve, reject) => {
			return this.fbxLoader.load(
				file,
				(object) => {
					const mixer = new THREE.AnimationMixer(object);
					const action: THREE.AnimationAction = mixer.clipAction(
						(object as THREE.Object3D).animations[0]
					);
					action.play();
					const payload: ActorPayload = {
						object,
						action,
						mixer
					};
					resolve(payload);
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
}


export default class Actor extends Entity {
	object: THREE.Group;
	animationActions: THREE.AnimationAction[] = [];
	currentAction?: THREE.AnimationAction;
	mixer: THREE.AnimationMixer;

	constructor(stage: Stage, payload: ActorPayload) {
		super(stage, 'player-test');
		const { action, mixer, object } = payload;

		const position = object.position;
		this.createBody(position);

		const skinnedMesh = object.children[0] as THREE.SkinnedMesh;
		let geometry = skinnedMesh.geometry as THREE.BufferGeometry;
		this.collisionCustomGeometry(geometry);

		this.currentAction = action;
		this.mixer = mixer;
		this.object = object;

		this.currentAction.play();
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
