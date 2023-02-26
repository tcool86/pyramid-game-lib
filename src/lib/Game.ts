
import RAPIER from '@dimforge/rapier3d-compat';
import { PyramidStage } from './Stage';
import Menu from './Menu';
import { Create } from './Create';
import Gamepad, { ControllerInput } from './Gamepad';

import { Clock } from 'three';
import Globals from './Globals';
import { Entity } from './Entities';
import { PyramidCamera } from './Camera';
import { PyramidActor } from './Entities/Actor';

// TODO: will this type "known partial" be necessary at all?
// May come in handy for situations where we want to assume the property
// is known but we don't want to enforce all the properties.
type KnownPartial<T> = Partial<Record<keyof T, T[keyof T]>>;

export interface PyramidParams {
	ticks: number;
	frame: (timer: number, callback: Function) => void;
	entity: Entity;
	game: PyramidGame;
	stage: PyramidStage;
	camera: PyramidCamera;
	globals: Globals;
	scene: THREE.Scene;
	world: RAPIER.World;
	audio: unknown;
	inputs: ControllerInput[]; // TODO: controller input should be a map of "player" controllers
	create: Function;
}

interface GameOptions {
	loop: ({ }: PyramidParams) => void;
	setup: ({ }: PyramidParams) => void;
	globals: Globals;
	stages: Function[];
}

export interface PyramidGameEntity {
	loop: (params: PyramidParams) => void;
	setup: (params: PyramidParams) => void;
}

export interface ActorParams extends PyramidParams {
	entity: PyramidActor;
}

export interface GameActor {
	loop: (params: ActorParams) => void;
	setup: (params: ActorParams) => void;
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

export class PyramidGame {
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
		const gameSetupParameters = {
			create: commands.create,
			globals: this._globals,
			camera: this.stage()._camera
		};

		this.stage()._setup(gameSetupParameters);
		this._setup(gameSetupParameters);
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
