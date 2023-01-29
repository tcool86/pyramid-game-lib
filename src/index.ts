import Debug from './lib/Debug';
import Game from './lib/Game';
import Gamepad from './lib/Gamepad';
import Globals from './lib/Globals';
import Menu from './lib/Menu';
import { Stage } from './lib/Stage';
import Util from './lib/Util';
import { Actor, Collision, Box, Sphere, Trigger } from './lib/Entities';
import { Materials } from './lib/Entities/Materials';

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