
import RAPIER from '@dimforge/rapier3d-compat';
import Stage from './Stage';
import { Menu } from './Menu';
import Entity from './Entities/Entity';
import { Primitives, PrimitiveOptions } from './Entities/Primitives';
import { Triggers, TriggerOptions, TriggerEntity } from './Entities/Triggers';
import { ActorOptions, Loaders } from './Entities/Loaders';
import Actor from './Entities/Actor';
import { materials } from './Entities/Materials';
import Gamepad, { ControllerInput } from './Gamepad';

import { Clock } from 'three';

export interface LoopInterface {
	ticks: number;
	inputs: ControllerInput[];
	player: Actor;
	stage: Stage;
}

export interface SetupInterface {
	primitives: {
		createBox(options: PrimitiveOptions): Entity;
		createSphere(options: PrimitiveOptions): Entity;
	};
	triggers: {
		createAreaTrigger(options: TriggerOptions): TriggerEntity;
	};
	loaders: {
		createActor(options: ActorOptions): Actor
	}
	materials: {
		metal: THREE.Material;
	};
}

interface GameOptions {
	loop: ({ }: LoopInterface) => void;
	setup: ({ }: SetupInterface) => void;
}

class Game {
	stages: Stage[] = [];
	currentStage: number = 0;
	menu?: Menu;
	loop: Function;
	setup: Function;
	gamepad: Gamepad;
	clock: Clock;
	ready: Promise<boolean>;

	constructor({ loop, setup }: GameOptions) {
		this.gamepad = new Gamepad();
		this.clock = new Clock();
		this.loop = loop;
		this.setup = setup;
		this.ready = new Promise(async (resolve, reject) => {
			try {
				const world = await this.loadPhysics();
				this.stages.push(new Stage(world));
				await this.gameSetup();
				const self = this;
				requestAnimationFrame(() => {
					self.gameLoop(self)
				});
				resolve(true);
			} catch (error) {
				reject(error);
			}
		});
	}

	async loadPhysics() {
		await RAPIER.init();
		const world = new RAPIER.World({ x: 0.0, y: -9.81, z: 0.0 });

		return world;
	}

	/**
	 * Main game loop
	 * process user input
	 * update physics
	 * render scene
	 */
	async gameLoop(self: Game) {
		const inputs = this.gamepad.getInputs();
		const ticks = this.clock.getDelta();
		this.stage().update(ticks);

		const player = this.stage().getPlayer() ?? { move: () => { } };
		this.loop({
			ticks,
			inputs,
			player,
			stage: this.stage()
		});

		this.stage().render();
		requestAnimationFrame(() => {
			self.gameLoop(self);
		});
	}

	async gameSetup() {
		const primitives = Primitives(this.stage());
		const triggers = Triggers(this.stage());
		const loaders = Loaders(this.stage());
		this.setup({
			primitives,
			materials,
			triggers,
			loaders
		});
	}

	stage() {
		return this.stages[this.currentStage];
	}

	domElement() {
		const element = this.stage().renderer.domElement ?? document.createElementNS('http://www.w3.org/1999/xhtml', 'canvas');
		return element;
	}
}

export default Game;
