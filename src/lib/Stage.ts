import {
	Scene,
	Color,
	Vector2,
	WebGLRenderer,
	AmbientLight,
	DirectionalLight,
} from 'three';
import { World, Collider } from '@dimforge/rapier3d-compat';
import Entity from './Entities/Entity';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
// import RenderPass from './rendering/RenderPixelatedPass';
// import RenderPass from './rendering/RenderWobblyPass';
import RenderPass from './rendering/RenderPass';
import { TriggerEntity } from './Entities/Triggers';
import { PyramidActor } from './Entities/Actor';
import { Create } from './Create';
import { PyramidCamera } from './Camera';

interface EntityColliderData {
	id: string;
}

export function Stage({ world }: { world: World }) {
	return (target: any) => {
		const gameInstance = new target();
		const pyramidInstance = new PyramidStage(world);
	}
}

export class PyramidStage {
	world: World;
	scene: Scene;

	screenResolution!: Vector2;
	renderer!: WebGLRenderer;
	composer!: EffectComposer;

	_camera!: PyramidCamera;

	colliders: Map<string, Entity>;
	intersectors: Map<string, Entity>;
	children: Map<string, Entity>;
	players: Map<string, PyramidActor>;

	constructor(world: World) {
		const scene = new Scene();
		scene.background = new Color(0x5843c1);

		this.setupRenderer();
		this.setupLighting(scene);
		this.setupCamera(scene);

		this.scene = scene;
		this.world = world;
		this.children = new Map();
		this.colliders = new Map();
		this.intersectors = new Map();
		this.players = new Map();
	}

	setupRenderer() {
		let screenResolution = new Vector2(window.innerWidth, window.innerHeight);
		this.screenResolution = screenResolution;

		this.renderer = new WebGLRenderer({ antialias: false });
		this.renderer.setSize(screenResolution.x, screenResolution.y);
		this.composer = new EffectComposer(this.renderer);
	}

	setupLighting(scene: Scene) {
		const ambientLight = new AmbientLight(0xffffff, 0.8);
		scene.add(ambientLight);

		const directionalLight = new DirectionalLight(0xffffff, 1);
		directionalLight.name = 'Light';
		directionalLight.position.set(0, 100, 0);
		directionalLight.castShadow = true;
		directionalLight.shadow.camera.near = 0.1;
		directionalLight.shadow.camera.far = 2000;
		directionalLight.shadow.mapSize.width = 1024;
		directionalLight.shadow.mapSize.height = 1024;
		scene.add(directionalLight);
	}

	setupCamera(scene: Scene) {
		// TODO: Should PyramidCamera wrap camera or extend it?
		this._camera = new PyramidCamera(this.screenResolution);
		let renderResolution = this.screenResolution.clone().divideScalar(2);
		renderResolution.x |= 0;
		renderResolution.y |= 0;
		// TODO: the _camera.camera is a bit wierd. 🤷🏻‍♂️
		this.composer.addPass(new RenderPass(renderResolution, scene, this._camera.camera));
	}

	addChild(id: string, child: any) {
		if (child._setup) {
			const commands = Create(this);
			child._setup({
				entity: child,
				commands
			});
		}
		this.children.set(id, child);
		const { _ref } = child;
		if (_ref.__proto__._collision && !child.isSensor) {
			this.colliders.set(child.id, child);
		}
		if (child.isSensor) {
			this.intersectors.set(child.id, child);
			console.log(this.intersectors);
		}
	}

	update({ delta, inputs }: { delta: number, inputs: any }) {
		this.world.step();
		const entityIterator = this.children.entries();
		let entityWrapper;
		while (entityWrapper = entityIterator.next().value) {
			const [, entity] = entityWrapper;
			entity.update({ delta, inputs });
		}
		this.updateCollision();
		this._camera.update();
	}

	updateCollision() {
		this.updateColliders();
		this.updateIntersectors();
	}

	getEntityFromCollider(collider: Collider): Entity | null {
		const parent = collider.parent();
		const userData: EntityColliderData = parent?.userData as EntityColliderData;
		if (!userData) {
			console.log('no user data on collider');
			return null;
		}
		const { id } = userData ?? { id: null };
		if (id === null) {
			console.log('no id on collider');
			return null;
		}
		const entity = this.children.get(id) as Entity;
		return entity;
	}

	updateColliders() {
		for (let [, collider] of this.colliders) {
			const { _ref } = collider;
			this.world.contactsWith(collider.body.collider(0), (otherCollider) => {
				const entity = this.getEntityFromCollider(otherCollider);
				if (!entity) {
					return;
				}
				const collisionHandler = _ref.__proto__._collision.get(entity.collisionKey);
				if (collisionHandler) {
					const { name, original } = collisionHandler;
					original.bind(_ref)({
						entity: collider,
						target: entity
					});
				}
			})
		}
	}

	isTrigger(entity: Entity): entity is TriggerEntity {
		return 'onEnter' in entity && 'onExit' in entity && 'hasEntered' in entity;
	}

	// TODO: cleanup abstraction:
	/*******
	  the idea behind area triggers and standard sensor based intersectors is that triggers
	  built-in functionality for determining when an object enters and exits.
	********/
	updateIntersectors() {
		if (!this.intersectors) return;
		for (let [, intersector] of this.intersectors) {
			const { _ref } = intersector;
			if (this.isTrigger(intersector)) {
				if (intersector.onExit && intersector.hasEntered) {
					intersector.onExit();
					console.log('exited area');
				}
			}
			this.world.intersectionsWith(intersector.body.collider(0), (otherCollider) => {
				const entity = this.getEntityFromCollider(otherCollider);
				if (entity && entity.collisionKey) {
					const collisionHandler = _ref.__proto__._collision.get(entity.collisionKey);
					if (collisionHandler) {
						const { name, original } = collisionHandler;
						original.bind(_ref)({
							entity: intersector,
							target: entity
						});
					}
				}
				if (this.isTrigger(intersector)) {
					if (intersector.onEnter) {
						intersector.onEnter();
					}
				}
			});
		}
	}

	render() {
		this.composer.render();
	}

	element() {
		return this.renderer.domElement;
	}
}