
import RAPIER from '@dimforge/rapier3d-compat';
import { PyramidStage } from './Stage';
import Menu from './Menu';
import { Create } from './Create';
import Gamepad, { ControllerInput } from './Gamepad';

import { Clock } from 'three';
import Globals from './Globals';
import { Entity } from './Entities';
import { Frame } from './Entities/Frame';

export interface BaseGameEntityInterface {
	ticks: number;
	frame: Frame;
	// self?: Entity;
	entity: Entity; // TODO: replace entity with self?
	stage: PyramidStage;
	camera: unknown;
	globals: Globals;
	scene: THREE.Scene;
	world: RAPIER.World;
	audio: unknown;
	inputs: ControllerInput[]; // TODO: controller input should be a map of "player" controllers
}

export interface LoopInterface extends BaseGameEntityInterface {
	spawn: unknown; // TODO: what's the difference between spawn and create? Synchronicity?
}

export interface SetupInterface extends BaseGameEntityInterface {
	commands: {
		create: Function; // TODO: this should be moved out
	};
}

interface GameOptions {
	loop: ({ }: LoopInterface) => void;
	setup: ({ }: SetupInterface) => void;
	globals: Globals;
	stages: Function[];
}

export interface PyramidGameEntity {
	loop: (params: Partial<LoopInterface>) => void;
	setup: (params: Partial<SetupInterface>) => void;
}

function Game({ app, stages = [] }: { app: HTMLElement | string, stages?: Function[] }) {
	return (target: any) => {
		const gameInstance = new target();
		const pyramidInstance = new PyramidGame({
			loop: gameInstance.loop.bind(gameInstance),
			setup: gameInstance.setup.bind(gameInstance),
			globals: Globals.getInstance(),
			stages: stages,
		});
		pyramidInstance.ready.then(() => {
			let appElement;
			if (typeof app === 'string') {
				appElement = document.querySelector<HTMLDivElement>('#app')!;
			} else {
				appElement = app;
			}
			appElement.appendChild(pyramidInstance.domElement());
			if (gameInstance.ready) {
				gameInstance.ready.bind(gameInstance)();
			}
		})
	}
}

class PyramidGame {
	stages: PyramidStage[] = [];
	currentStage: number = 0;
	menu?: Menu;
	_globals: Globals;
	_loop: Function;
	_setup: Function;
	_stages: any[]; // TODO: define type here
	gamepad: Gamepad;
	pause: boolean;
	clock: Clock;
	ready: Promise<boolean>;

	constructor({ loop, setup, globals, stages }: GameOptions) {
		this.gamepad = new Gamepad();
		this.clock = new Clock();
		this.pause = false;
		this._loop = loop;
		this._setup = setup;
		this._globals = globals;
		this._stages = stages;
		this.ready = new Promise(async (resolve, reject) => {
			try {
				const world = await this.loadPhysics();

				for (const stageCreator of this._stages) {
					const stage = stageCreator.prototype.init(world) as PyramidStage;
					this.stages.push(stage);
				}
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
	async gameLoop(self: PyramidGame) {
		const inputs = this.gamepad.getInputs();
		const ticks = this.clock.getDelta();
		if (!this.pause) {
			this.stage().update({
				delta: ticks,
				inputs
			});
		}

		this._loop({
			ticks,
			inputs,
			stage: this.stage(),
			globals: this._globals,
			game: this,
		});

		this.stage().render();
		requestAnimationFrame(() => {
			self.gameLoop(self);
		});
	}

	async gameSetup() {
		const commands = await Create(this.stage());
		this.stage()._setup({
			commands,
			globals: this._globals,
			camera: this.stage()._camera
		})
		this._setup({
			commands,
			globals: this._globals,
			camera: this.stage()._camera
		});
	}

	stage() {
		return this.stages[this.currentStage];
	}

	domElement() {
		const canvas = document.createElementNS('http://www.w3.org/1999/xhtml', 'canvas');
		const element = this.stage().element() ?? canvas;
		return element;
	}
}

export default Game;
