import { Vector2, Camera, PerspectiveCamera, Vector3 } from 'three';
import { Entity } from './Entities';
// import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

export class PyramidCamera {
	camera: Camera;
	follow: Entity | null;

	constructor(screenResolution: Vector2) {
		let aspectRatio = screenResolution.x / screenResolution.y;
		this.camera = new PerspectiveCamera(45, aspectRatio, 0.1, 1000);
		this.camera.position.z = 20;
		this.camera.position.y = 6 * Math.tan(Math.PI / 3);
		this.follow = null;
		// const controls = new OrbitControls(camera, renderer.domElement)
		// controls.target.set(0, 0, 0);
		// controls.update();
	}

	update() {
		if (this.follow) {
			this.moveFollowCamera();
		}
	}

	moveFollowCamera() {
		const entity = this.follow;
		const { x, y, z } = entity?.body.translation() || { x: 0, y: 0, z: 0 };
		const entityPosition = new Vector3(x, y, z);
		this.camera.lookAt(entityPosition);
	}

	followEntity(entity: Entity) {
		this.follow = entity;
	}
}