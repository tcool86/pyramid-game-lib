import Debug from './lib/Debug';
import Game, { PyramidGameEntity } from './lib/Game';
import Gamepad from './lib/Gamepad';
import Globals from './lib/Globals';
import Menu from './lib/Menu';
import { Stage } from './lib/Stage';
import Util from './lib/Util';
import { Actor, Collision, Box, Sphere, Trigger } from './lib/Entities';
import { Materials } from './lib/Entities/Materials';

// TODO: export any interface that will be used by dev
export type { PyramidGameEntity as GameEntity };

const Pyramid = {
	Debug,
	Game,
	Gamepad,
	Globals,
	Menu,
	Stage,
	Entity: { Actor, Collision, Materials, Box, Sphere, Trigger },
	Util,
}
export default Pyramid;