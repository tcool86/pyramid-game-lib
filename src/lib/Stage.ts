import RAPIER from '@dimforge/rapier3d-compat';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
// import RenderPass from './rendering/RenderPixelatedPass';
// import RenderPass from './rendering/RenderWobblyPass';
import RenderPass from './rendering/RenderPass';
import Entity from './Entities/Entity';
import { TriggerEntity } from './Entities/Triggers';
import { PyramidActor } from './Entities/Actor';

interface EntityColliderData {
	id: string;
}

export default class Stage {
	world: RAPIER.World;
	scene: THREE.Scene;
	renderer: THREE.WebGLRenderer;
	composer: EffectComposer;
	triggers: Map<string, TriggerEntity>;
	children: Map<string, Entity>;
	players: Map<string, PyramidActor>;

	constructor(world: RAPIER.World) {
		const scene = new THREE.Scene();
		let screenResolution = new THREE.Vector2(window.innerWidth, window.innerHeight);
		let renderResolution = screenResolution.clone().divideScalar(2);
		renderResolution.x |= 0;
		renderResolution.y |= 0;

		let aspectRatio = screenResolution.x / screenResolution.y;

		const camera = new THREE.PerspectiveCamera(45, aspectRatio, 0.1, 1000);
		camera.position.z = 20;
		camera.position.y = 6 * Math.tan(Math.PI / 3);

		scene.background = new THREE.Color(0x5843c1);

		const ambientLight = new THREE.AmbientLight(0xffffff);
		scene.add(ambientLight);

		const pointLight = new THREE.PointLight(0xFFF, 5.0, 50.0);
		pointLight.position.set(0, -1, 0);
		scene.add(pointLight);

		const renderer = new THREE.WebGLRenderer({ antialias: false });
		renderer.setSize(screenResolution.x, screenResolution.y);

		const composer = new EffectComposer(renderer);
		composer.addPass(new RenderPass(renderResolution, scene, camera));

		const controls = new OrbitControls(camera, renderer.domElement)
		controls.target.set(0, 0, 0);
		controls.update();

		this.renderer = renderer;
		this.composer = composer;
		this.scene = scene;
		this.world = world;
		this.children = new Map();
		this.triggers = new Map();
		this.players = new Map();
	}

	addChild(id: string, child: any) {
		if (child._setup) {
			child._setup({
				entity: child
			});
		}
		this.children.set(id, child);
	}

	update(delta: number) {
		this.world.step();
		const entityIterator = this.children.entries();
		let entityWrapper;
		while (entityWrapper = entityIterator.next().value) {
			const [, entity] = entityWrapper;
			entity.update(delta);
		}
		this.updateColliders();
	}

	updateColliders() {
		if (!this.players) return;
		for (let [, player] of this.players) {
			this.world.contactsWith(player.body.collider(0), (otherCollider) => {
				const object = otherCollider.parent();
				const userData: EntityColliderData = object?.userData as EntityColliderData;
				if (!userData) {
					console.log('no user data on collider');
					return;
				}
				const { id } = userData ?? { id: null };
				if (id === null) {
					console.log('no id on collider');
					return;
				} else {
					const entity = this.children.get(id) as Entity;
					const material = entity.debug?.material as THREE.MeshPhongMaterial;
					material.color?.set(0x009900);
				}
			});
			this.updateIntersections(player);
		}
	}

	updateIntersections(player: PyramidActor) {
		if (!this.triggers) return;
		for (let [, trigger] of this.triggers) {
			const isColliding = this.world.intersectionPair(
				trigger.body.collider(0),
				player.body.collider(0)
			);
			if (isColliding) {
				if (trigger.onEnter) {
					trigger.onEnter();
				}
			} else {
				if (trigger.onExit) {
					trigger.onExit();
				}
			}
		}
	}

	render() {
		this.composer.render();
	}

	getPlayer() {
		// return player node
		return this.players.get('test-id');
	}

}