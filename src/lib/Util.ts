import RAPIER from '@dimforge/rapier3d-compat';
import * as THREE from 'three';

export type Vector3Type = RAPIER.Vector3 | THREE.Vector3 | Vector3;

export class Vector3 extends THREE.Vector3 {
	x: number;
	y: number;
	z: number;
	constructor(x?: number, y?: number, z?: number) {
		super();
		this.x = x ?? 0;
		this.y = y ?? 0;
		this.z = z ?? 0;
	}
}

export class Vector2 extends THREE.Vector2 {
	x: number;
	y: number;
	constructor(x?: number, y?: number) {
		super();
		this.x = x ?? 0;
		this.y = y ?? 0;
	}
}

export default {
	Vector3,
	Vector2
}