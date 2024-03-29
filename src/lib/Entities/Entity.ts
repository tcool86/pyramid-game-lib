import { PyramidStage } from "../Stage";
import { Vector3 } from '../Util';
import RAPIER from '@dimforge/rapier3d-compat';
import * as THREE from 'three';
import { BufferGeometry, Vector2 } from "three";
import { frameMaker } from "./Frame";

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

// TODO: move this somewhere appropriate
export function pixelTexture(texture: THREE.Texture) {
	texture.minFilter = THREE.NearestFilter;
	texture.magFilter = THREE.NearestFilter;
	texture.wrapS = THREE.ClampToEdgeWrapping;
	texture.wrapT = THREE.ClampToEdgeWrapping;
	texture.format = THREE.RGBFormat;
	texture.flipY = false;
	return texture;
}

export default class Entity implements EntityBuilder {
	id: string;
	material?: THREE.Material;
	geometry?: THREE.BoxGeometry | THREE.SphereGeometry;
	mesh?: THREE.Mesh;
	body!: RAPIER.RigidBody;
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

	static instanceCounter = 0;

	constructor(stage: PyramidStage, tag: string) {
		this.stageRef = stage;
		this.tag = tag;
		this.debug = null;
		this.debugColor = 0xFFFFFF;
		this.showDebug = false;
		this.isSensor = false;
		this.id = `e-${Entity.instanceCounter++}`;
		this._frames = new Map();
	}

	rectangularMesh(size: Vector3, position: Vector3) {
		const { scene } = this.stageRef;
		const geometry = new THREE.BoxGeometry(size.x, size.y, size.z);
		this.mesh = new THREE.Mesh(geometry, this.material);
		this.mesh.position.set(position.x, position.y, position.z);
		this.mesh.castShadow = true;
		this.mesh.receiveShadow = true;
		scene.add(this.mesh);
		this.createDebugMesh(geometry, position);
	}

	sphericalMesh(radius: number, position: Vector3) {
		const { scene } = this.stageRef;
		const geometry = new THREE.SphereGeometry(radius);
		this.mesh = new THREE.Mesh(geometry, this.material);
		this.mesh.position.set(position.x, position.y, position.z);
		this.mesh.castShadow = true;
		this.mesh.receiveShadow = true;
		scene.add(this.mesh);
		this.createDebugMesh(geometry, position);
	}

	noMesh() { }

	createDebugMesh(geometry: BufferGeometry, position: Vector3, color: number = 0xFFFFFF) {
		const { scene } = this.stageRef;
		const debugMaterial = new THREE.MeshPhongMaterial({
			color: new THREE.Color(color),
		});
		debugMaterial.wireframe = true;
		debugMaterial.needsUpdate = true;
		this.debugColor = color;
		this.debug = new THREE.Mesh(geometry, debugMaterial);
		this.debug.position.set(position.x, position.y, position.z);
		scene.add(this.debug);
	}

	createBody(position: Vector3): void {
		const { world } = this.stageRef;
		const { x, y, z } = position ?? { x: 0, y: 0, z: 0 };
		const rigidBodyDesc = RAPIER.RigidBodyDesc.dynamic().setTranslation(x, y, z);
		rigidBodyDesc.setLinearDamping(1.0).setAngularDamping(1.0);
		rigidBodyDesc.userData = { id: this.id };
		this.body = world.createRigidBody(rigidBodyDesc);
	}

	collisionRectangular(size: Vector3, isSensor: boolean = false) {
		const { world } = this.stageRef;
		const half = { x: size.x / 2, y: size.y / 2, z: size.z / 2 };
		let colliderDesc = RAPIER.ColliderDesc.cuboid(half.x, half.y, half.z);
		colliderDesc.setSensor(isSensor);
		if (isSensor) {
			// "KINEMATIC_FIXED" will only sense actors moving through the sensor
			colliderDesc.activeCollisionTypes = RAPIER.ActiveCollisionTypes.KINEMATIC_FIXED;
			// colliderDesc.setActiveHooks(RAPIER.ActiveHooks.FILTER_INTERSECTION_PAIRS);
		}
		world.createCollider(colliderDesc, this.body);
	}

	collisionSpherical(radius: number, isSensor: boolean = false) {
		const { world } = this.stageRef;
		let colliderDesc = RAPIER.ColliderDesc.ball(radius);
		colliderDesc.setSensor(isSensor);
		world.createCollider(colliderDesc, this.body);
	}

	collisionCustomGeometry(geometry: THREE.BufferGeometry) {
		const { world } = this.stageRef;

		geometry.computeBoundingBox();
		let hitBox = geometry.boundingBox;

		let size = new THREE.Vector3();
		hitBox?.getSize(size);

		let sphere = new THREE.Sphere();
		hitBox?.getBoundingSphere(sphere);

		let colliderDesc = RAPIER.ColliderDesc.capsule((size.y) / 4, sphere.radius / 4);
		colliderDesc.setTranslation(0, 1, 0);

		this.body.setTranslation(new RAPIER.Vector3(0, size.y / 4, 0), true);
		world.createCollider(colliderDesc, this.body);

		this.createDebugMesh(geometry, new Vector3(), 0xFFff00);
	}

	collisionStatic() {
		this.body.setBodyType(RAPIER.RigidBodyType.Fixed);
	}

	setRotation(x: number = 0, y: number = 0, z: number = 0): void {
		this.body.setRotation({ x, y, z, w: 1 }, true);
	}

	rotateX(amount: number) {
		const current = this.body.rotation();
		this.setRotation(current.x + amount, 0, 0);
	}

	rotateY(amount: number) {
		const current = this.body.rotation();
		this.setRotation(0, current.y + amount, 0);
	}

	rotateZ(amount: number) {
		const current = this.body.rotation();
		this.setRotation(0, 0, current.z + amount);
	}

	angularVelocity(vector: Vector3) {
		this.body.setAngvel(vector, true);
	}

	applyMaterial(texturePath: string | null, color: number, repeat: Vector2) {
		let material;
		if (texturePath) {
			const loader = new THREE.TextureLoader();
			loader.setPath('');

			const texture = loader.load(texturePath);
			texture.repeat = repeat;
			texture.wrapS = THREE.RepeatWrapping;
			texture.wrapT = THREE.RepeatWrapping;
			material = new THREE.MeshPhongMaterial({
				color: color,
				map: texture,
				// bumpMap: texture,
				// bumpScale: 0.3
			});
		} else {
			material = new THREE.MeshStandardMaterial({
				color: color,
				emissiveIntensity: 0.5,
				lightMapIntensity: 0.5,
				fog: true,
			});
		}
		this.material = material;
	}

	update({ delta, inputs }: { delta: number, inputs: any }) {
		const translationVector: RAPIER.Vector = this.body.translation();
		const rotationVector: RAPIER.Rotation = this.body.rotation();
		if (this.mesh) {
			this.mesh.position.set(translationVector.x, translationVector.y, translationVector.z);
			this.mesh.rotation.set(rotationVector.x, rotationVector.y, rotationVector.z);
		}
		if (this.showDebug && this.debug) {
			this.debug.position.set(translationVector.x, translationVector.y, translationVector.z);
			this.debug.rotation.set(rotationVector.x, rotationVector.y, rotationVector.z);
			const material = this.debug.material as THREE.MeshPhongMaterial;
			material.color?.set(this.debugColor);
		} else {
			const material = this.debug?.material as THREE.MeshPhongMaterial;
			material?.setValues({
				visible: false
			});
		}
		if (this._loop) {
			this._loop({
				entity: this,
				delta,
				inputs,
				frame: frameMaker(delta, this)
			});
		}
	}

}

Entity.prototype.toString = function () {
	let output = '';
	output += `id: ${this.id}\n`;
	output += `tag: ${this.tag}\n`;
	output += `body: ${this.body.handle}\n`;
	output += `mesh: ${this?.mesh?.uuid}\n`;
	output += `debug mesh: ${this?.debug?.uuid}\n`;
	return output;
}