'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var RAPIER = require('@dimforge/rapier3d-compat');
var THREE = require('three');
var EffectComposer = require('three/examples/jsm/postprocessing/EffectComposer');
var OrbitControls = require('three/examples/jsm/controls/OrbitControls');
var Pass = require('three/examples/jsm/postprocessing/Pass');
var FBXLoader = require('three/examples/jsm/loaders/FBXLoader');
var stateshot = require('stateshot');

function _interopDefault (e) { return e && e.__esModule ? e : { 'default': e }; }

function _interopNamespace(e) {
	if (e && e.__esModule) return e;
	var n = Object.create(null);
	if (e) {
		Object.keys(e).forEach(function (k) {
			if (k !== 'default') {
				var d = Object.getOwnPropertyDescriptor(e, k);
				Object.defineProperty(n, k, d.get ? d : {
					enumerable: true,
					get: function () { return e[k]; }
				});
			}
		});
	}
	n["default"] = e;
	return Object.freeze(n);
}

var RAPIER__default = /*#__PURE__*/_interopDefault(RAPIER);
var THREE__namespace = /*#__PURE__*/_interopNamespace(THREE);

class Debug extends HTMLElement {
  constructor() {
    console.log("debug element under construction");
    super();
  }
  init() {
    // window.customElements.define('pyramid-debug', PyramidDebugElement);
    // const debugElement = document.createElement('pyramid-debug');
    // app.appendChild(debugElement);
  }
}

class RenderPass extends Pass.Pass {
  constructor(resolution, scene, camera) {
    super();
    this.resolution = resolution;
    this.fsQuad = new Pass.FullScreenQuad(this.material());
    this.scene = scene;
    this.camera = camera;
    this.rgbRenderTarget = new THREE.WebGLRenderTarget(resolution.x * 4, resolution.y * 4);
    this.normalRenderTarget = new THREE.WebGLRenderTarget(resolution.x * 4, resolution.y * 4);
    this.normalMaterial = new THREE__namespace.MeshNormalMaterial();
  }
  render(renderer, writeBuffer) {
    renderer.setRenderTarget(this.rgbRenderTarget);
    renderer.render(this.scene, this.camera);
    const overrideMaterial_old = this.scene.overrideMaterial;
    renderer.setRenderTarget(this.normalRenderTarget);
    this.scene.overrideMaterial = this.normalMaterial;
    renderer.render(this.scene, this.camera);
    this.scene.overrideMaterial = overrideMaterial_old;

    // @ts-ignore
    const uniforms = this.fsQuad.material.uniforms;
    uniforms.tDiffuse.value = this.rgbRenderTarget.texture;
    uniforms.tDepth.value = this.rgbRenderTarget.depthTexture;
    uniforms.tNormal.value = this.normalRenderTarget.texture;
    if (this.renderToScreen) {
      renderer.setRenderTarget(null);
    } else {
      renderer.setRenderTarget(writeBuffer);
    }
    this.fsQuad.render(renderer);
  }
  material() {
    return new THREE__namespace.ShaderMaterial({
      uniforms: {
        tDiffuse: {
          value: null
        },
        tDepth: {
          value: null
        },
        tNormal: {
          value: null
        },
        resolution: {
          value: new THREE__namespace.Vector4(this.resolution.x, this.resolution.y, 1 / this.resolution.x, 1 / this.resolution.y)
        }
      },
      vertexShader: `varying vec2 vUv;

			void main() {
				vUv = uv;
				gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
			}`,
      fragmentShader: `uniform sampler2D tDiffuse;
			varying vec2 vUv;
			
			void main() {
				vec4 texel = texture2D( tDiffuse, vUv );
			
				gl_FragColor = texel;
			}`
    });
  }
}

class Stage {
  constructor(world) {
    const scene = new THREE__namespace.Scene();
    let screenResolution = new THREE__namespace.Vector2(window.innerWidth, window.innerHeight);
    let renderResolution = screenResolution.clone().divideScalar(2);
    renderResolution.x |= 0;
    renderResolution.y |= 0;
    let aspectRatio = screenResolution.x / screenResolution.y;
    const camera = new THREE__namespace.PerspectiveCamera(45, aspectRatio, 0.1, 1000);
    camera.position.z = 20;
    camera.position.y = 6 * Math.tan(Math.PI / 3);
    scene.background = new THREE__namespace.Color(0x5843c1);
    const ambientLight = new THREE__namespace.AmbientLight(0xffffff);
    scene.add(ambientLight);
    const pointLight = new THREE__namespace.PointLight(0xFFF, 5.0, 50.0);
    pointLight.position.set(0, -1, 0);
    scene.add(pointLight);
    const renderer = new THREE__namespace.WebGLRenderer({
      antialias: false
    });
    renderer.setSize(screenResolution.x, screenResolution.y);
    const composer = new EffectComposer.EffectComposer(renderer);
    composer.addPass(new RenderPass(renderResolution, scene, camera));
    const controls = new OrbitControls.OrbitControls(camera, renderer.domElement);
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
  update(delta) {
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
      this.world.contactsWith(player.body.collider(0), otherCollider => {
        const object = otherCollider.parent();
        const userData = object?.userData;
        if (!userData) {
          console.log('no user data on collider');
          return;
        }
        const {
          id
        } = userData ?? {
          id: null
        };
        if (id === null) {
          console.log('no id on collider');
          return;
        } else {
          const entity = this.children.get(id);
          const material = entity.debug?.material;
          material.color?.set(0x009900);
        }
      });
      this.updateIntersections(player);
    }
  }
  updateIntersections(player) {
    if (!this.triggers) return;
    for (let [, trigger] of this.triggers) {
      const isColliding = this.world.intersectionPair(trigger.body.collider(0), player.body.collider(0));
      if (isColliding) {
        if (trigger.action) {
          trigger.action();
        }
      } else {
        if (trigger.exitAction) {
          trigger.exitAction();
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

class Vector3 extends THREE__namespace.Vector3 {
  constructor(x, y, z) {
    super();
    this.x = x ?? 0;
    this.y = y ?? 0;
    this.z = z ?? 0;
  }
}
class Vector2 extends THREE__namespace.Vector2 {
  constructor(x, y) {
    super();
    this.x = x ?? 0;
    this.y = y ?? 0;
  }
}
var Util = {
  Vector3,
  Vector2
};

class Entity {
  static instanceCounter = 0;
  constructor(stage, tag) {
    this.stageRef = stage;
    this.tag = tag;
    this.debug = null;
    this.debugColor = 0xFFFFFF;
    this.showDebug = false;
    this.id = `e-${Entity.instanceCounter++}`;
  }
  rectangularMesh(size, position) {
    const {
      scene
    } = this.stageRef;
    const geometry = new THREE__namespace.BoxGeometry(size.x, size.y, size.z);
    this.mesh = new THREE__namespace.Mesh(geometry, this.material);
    this.mesh.position.set(position.x, position.y, position.z);
    this.mesh.castShadow = true;
    scene.add(this.mesh);
    this.createDebugMesh(geometry, position);
  }
  sphericalMesh(radius, position) {
    const {
      scene
    } = this.stageRef;
    const geometry = new THREE__namespace.SphereGeometry(radius);
    this.mesh = new THREE__namespace.Mesh(geometry, this.material);
    this.mesh.position.set(position.x, position.y, position.z);
    this.mesh.castShadow = true;
    scene.add(this.mesh);
    this.createDebugMesh(geometry, position);
  }
  noMesh() {}
  createDebugMesh(geometry, position, color = 0xFFFFFF) {
    const {
      scene
    } = this.stageRef;
    const debugMaterial = new THREE__namespace.MeshPhongMaterial({
      color: new THREE__namespace.Color(color)
    });
    debugMaterial.wireframe = true;
    debugMaterial.needsUpdate = true;
    this.debugColor = color;
    this.debug = new THREE__namespace.Mesh(geometry, debugMaterial);
    this.debug.position.set(position.x, position.y, position.z);
    scene.add(this.debug);
  }
  createBody(position) {
    const {
      world
    } = this.stageRef;
    const {
      x,
      y,
      z
    } = position ?? {
      x: 0,
      y: 0,
      z: 0
    };
    const rigidBodyDesc = RAPIER__default["default"].RigidBodyDesc.dynamic().setTranslation(x, y, z);
    rigidBodyDesc.setLinearDamping(1.0).setAngularDamping(1.0);
    rigidBodyDesc.userData = {
      id: this.id
    };
    this.body = world.createRigidBody(rigidBodyDesc);
  }
  collisionRectangular(size, isSensor = false) {
    const {
      world
    } = this.stageRef;
    const half = {
      x: size.x / 2,
      y: size.y / 2,
      z: size.z / 2
    };
    let colliderDesc = RAPIER__default["default"].ColliderDesc.cuboid(half.x, half.y, half.z);
    colliderDesc.setSensor(isSensor);
    if (isSensor) {
      // "KINEMATIC_FIXED" will only sense actors moving through the sensor
      colliderDesc.activeCollisionTypes = RAPIER__default["default"].ActiveCollisionTypes.KINEMATIC_FIXED;
      // colliderDesc.setActiveHooks(RAPIER.ActiveHooks.FILTER_INTERSECTION_PAIRS);
    }

    world.createCollider(colliderDesc, this.body);
  }
  collisionSpherical(radius, isSensor = false) {
    const {
      world
    } = this.stageRef;
    let colliderDesc = RAPIER__default["default"].ColliderDesc.ball(radius);
    colliderDesc.setSensor(isSensor);
    world.createCollider(colliderDesc, this.body);
  }
  collisionCustomGeometry(geometry) {
    const {
      world
    } = this.stageRef;
    geometry.computeBoundingBox();
    let hitBox = geometry.boundingBox;
    let size = new THREE__namespace.Vector3();
    hitBox?.getSize(size);
    let sphere = new THREE__namespace.Sphere();
    hitBox?.getBoundingSphere(sphere);
    let colliderDesc = RAPIER__default["default"].ColliderDesc.capsule(size.y / 4, sphere.radius / 4);
    colliderDesc.setTranslation(0, 1, 0);
    this.body.setTranslation(new RAPIER__default["default"].Vector3(0, size.y / 4, 0), true);
    world.createCollider(colliderDesc, this.body);
    this.createDebugMesh(geometry, new Vector3(), 0xFFff00);
  }
  collisionStatic() {
    this.body.setBodyType(RAPIER__default["default"].RigidBodyType.Fixed);
  }
  setRotation() {
    const x = Number(this.mesh?.rotateX) ?? 0;
    const y = Number(this.mesh?.rotateY) ?? 0;
    const z = Number(this.mesh?.rotateZ) ?? 0;
    this.body.setRotation({
      x,
      y,
      z,
      w: 0
    }, true);
  }
  applyMaterial(texturePath, color, repeat) {
    let material;
    if (texturePath) {
      const loader = new THREE__namespace.TextureLoader();
      loader.setPath('');
      const texture = loader.load(texturePath);
      texture.repeat = repeat;
      texture.wrapS = THREE__namespace.RepeatWrapping;
      texture.wrapT = THREE__namespace.RepeatWrapping;
      material = new THREE__namespace.MeshPhongMaterial({
        color: color,
        map: texture
        // bumpMap: texture,
        // bumpScale: 0.3
      });
    } else {
      material = new THREE__namespace.MeshBasicMaterial({
        color: color
      });
    }
    this.material = material;
  }
  update(_delta) {
    const translationVector = this.body.translation();
    const rotationVector = this.body.rotation();
    if (this.mesh) {
      this.mesh.position.set(translationVector.x, translationVector.y, translationVector.z);
      this.mesh.rotation.set(rotationVector.x, rotationVector.y, rotationVector.z);
    }
    if (this.showDebug && this.debug) {
      this.debug.position.set(translationVector.x, translationVector.y, translationVector.z);
      this.debug.rotation.set(rotationVector.x, rotationVector.y, rotationVector.z);
      const material = this.debug.material;
      material.color?.set(this.debugColor);
    } else {
      const material = this.debug?.material;
      material?.setValues({
        visible: false
      });
    }
    if (this._loop) {
      this._loop(_delta);
    }
  }
}

class ActorLoader {
  constructor() {
    this.fbxLoader = new FBXLoader.FBXLoader();
    this.object = null;
    this.mixer = null;
    this.actions = [];
    this.animations = null;
  }
  loadFile(file) {
    return new Promise((resolve, reject) => {
      return this.fbxLoader.load(file, object => {
        if (!this.object) {
          this.object = object;
        }
        if (!this.mixer) {
          this.mixer = new THREE__namespace.AnimationMixer(object);
        }
        const animation = object.animations[0];
        resolve(animation);
      }, xhr => {
        console.log(xhr.loaded / xhr.total * 100 + '% loaded');
      }, error => {
        console.error(error);
        reject(error);
      });
    });
  }

  /**
   * load
   * loads fbx file paths for animating an actor entity
   * @param files
   */
  async load(files) {
    const promises = new Array();
    for (let file of files) {
      promises.push(this.loadFile(file));
    }
    const animations = await Promise.all(promises);
    this.animations = animations;
    for (let animation of this.animations) {
      if (this.mixer) {
        const action = this.mixer?.clipAction(animation);
        this.actions.push(action);
      }
    }
    return this;
  }
}
function Actor(options) {
  return target => {
    const actorInstance = new target();
    actorInstance.options = options;
    actorInstance.bootup = async (stage, payload) => {
      const pyramidActorInstance = new PyramidActor({
        stage,
        payload
      });
      pyramidActorInstance.actorLoop?.bind(actorInstance);
    };
    return actorInstance;
  };
}
class PyramidActor extends Entity {
  actions = [];
  constructor({
    stage,
    payload
  }) {
    super(stage, 'player-test');
    const {
      actions,
      mixer,
      object
    } = payload;
    const position = object.position;
    this.createBody(position);
    const skinnedMesh = object.children[0];
    let geometry = skinnedMesh.geometry;
    this.collisionCustomGeometry(geometry);
    this.actions = actions;
    this.animationIndex = 0;
    this.currentAction = actions[0];
    this.mixer = mixer;
    this.object = object;
    this.currentAction?.play();
    this.object.scale.set(1, 1, 1);
    this.body.lockRotations(true, true);
    this.body.setAdditionalMass(100, true);
    this.body.setBodyType(RAPIER.RigidBodyType.KinematicVelocityBased);
    stage.scene.add(this.object);
    this.id = 'test-id';
    return this;
  }
  move(moveVector) {
    // this.body.applyImpulse(moveVector, true);
    this.body.setLinvel(moveVector, true);
  }
  rotateInDirection(moveVector) {
    let rotate = Math.atan2(-moveVector.x, moveVector.z);
    this.rotateY(rotate);
  }
  rotate(rotation) {
    const {
      x,
      y,
      z
    } = rotation;
    const euler = new THREE__namespace.Euler(x, y, z);
    this.object.setRotationFromEuler(euler);
  }
  rotateX(amount) {
    this.rotate(new RAPIER.Vector3(amount, 0, 0));
  }
  rotateY(amount) {
    this.rotate(new RAPIER.Vector3(0, -amount, 0));
  }
  rotateZ(amount) {
    this.rotate(new RAPIER.Vector3(0, 0, amount));
  }
  animate(animationIndex) {
    if (this.actions.length === 0) {
      return;
    }
    if (this.animationIndex === animationIndex) {
      return;
    }
    const previousIndex = this.animationIndex;
    this.currentAction = this.actions[animationIndex];
    this.currentAction.play();
    this.actions[previousIndex].stop();
    this.animationIndex = animationIndex;
  }
  update(delta) {
    super.update(delta);
    const translationVector = this.body.translation();
    const rotationVector = this.body.rotation();
    this.object.position.set(translationVector.x, translationVector.y - 1, translationVector.z);
    this.object.rotation.set(rotationVector.x, rotationVector.y, rotationVector.z);
    if (this.showDebug) {
      // TODO: this is hacky, will all objects behave this way? Probably not...
      this.debug?.position.set(this.object.position.x - 2, this.object.position.y - 1, this.object.position.z);
      this.debug?.rotation.set(this.object.rotation.x, this.object.rotation.y, this.object.rotation.z);
    }
    this.mixer.update(delta);
    if (this.actorLoop) {
      this.actorLoop(delta);
    }
  }
}

function Collision(key) {
  return (target, name, descriptor) => {
    const original = descriptor.value;
    console.log({
      target,
      name,
      descriptor,
      original,
      key
    });
  };
}

/**
 * Functions for creating primitive geometries easily
 * easily create an object with collision and a texture
 * 
 */

function createBox(options, stage) {
  const {
    width,
    height,
    depth
  } = options;
  const position = options?.position || new Vector3(0, 0, 0);
  const entity = new Entity(stage, 'test');
  const size = new Vector3(width, height, depth);
  const color = options?.color || 0xFFFFFF;
  const texturePath = options?.texturePath || null;
  const textureSize = options?.textureSize || new Vector2(1, 1);
  entity.applyMaterial(texturePath, color, textureSize);
  entity.rectangularMesh(size, position);
  entity.createBody(position);
  entity.collisionRectangular(size);
  entity.body.setAdditionalMass(0.02, true);
  entity.body.setAngularDamping(0.1);
  if (options?.fixed) {
    entity.collisionStatic();
  }
  entity.debugColor = options?.debugColor ?? 0xffffff;
  entity.showDebug = options?.showDebug ?? false;
  stage.children.set(entity.id, entity);
  return entity;
}
function createSphere(options, stage) {
  const radius = options.radius ?? 1;
  const position = options?.position || new Vector3(0, 0, 0);
  const entity = new Entity(stage, 'test');
  const color = options?.color || 0xFFFFFF;
  const texturePath = options?.texturePath || null;
  const textureSize = options?.textureSize || new Vector2(1, 1);
  entity.applyMaterial(texturePath, color, textureSize);
  entity.sphericalMesh(radius, position);
  entity.createBody(position);
  entity.collisionSpherical(radius, options?.isSensor);
  entity.body.setAdditionalMass(0.02, true);
  entity.body.setAngularDamping(0.1);
  entity.debugColor = options?.debugColor ?? 0xffffff;
  entity.showDebug = options?.showDebug ?? false;
  stage.children.set(entity.id, entity);
  return entity;
}
function Primitives(stage) {
  return {
    createBox: options => {
      return createBox(options, stage);
    },
    createSphere: options => {
      return createSphere(options, stage);
    }
  };
}

function determineEntity(options) {
  const isSphere = options.radius;
  return isSphere ? createSphere : createBox;
}
function create(options, stage) {
  const fn = determineEntity(options);
  return fn(options, stage);
}
function Create(stage) {
  return {
    create: options => {
      return create(options, stage);
    }
  };
}

/**
 * Functions for creating primitive geometries easily
 * easily create an object with collision and a texture
 * 
 */

function createAreaTrigger(options, stage) {
  const {
    width,
    height,
    depth
  } = options;
  const position = options?.position || new Vector3(0, 0, 0);
  const entity = new Entity(stage, 'test');
  const size = new Vector3(width, height, depth);
  const color = options?.debugColor || 0xFFFFFF;
  const geometry = new THREE__namespace.BoxGeometry(width, height, depth);
  entity.createDebugMesh(geometry, position, color);
  entity.createBody(position);
  entity.collisionRectangular(size, true);
  entity.collisionStatic();
  entity.showDebug = options?.showDebug ?? false;
  entity.action = options.action;
  entity.exitAction = options.exitAction;
  stage.children.set(entity.id, entity);
  stage.triggers.set(entity.id, entity);
  return entity;
}
function Triggers(stage) {
  return {
    createAreaTrigger: options => {
      return createAreaTrigger(options, stage);
    }
  };
}

const metal = new THREE__namespace.Material();
const materials = {
  metal
};

class Gamepad {
  connections = new Map();
  keyboardInput = new Map();
  constructor() {
    this.hasSupport = true;
    this.lastConnection = -1;
    const interval = setInterval(() => {
      if (!this.hasSupport) {
        clearInterval(interval);
      }
      if (this.connections.size > this.lastConnection) {
        this.scanGamepads();
      }
    }, 200);
    window.addEventListener("gamepadconnected", event => {
      const {
        gamepad
      } = event;
      this.connections.set(gamepad.index, gamepad.connected);
    });
    window.addEventListener("gamepaddisconnected", event => {
      const {
        gamepad
      } = event;
      this.connections.delete(gamepad.index);
    });
    window.addEventListener("keydown", event => {
      const {
        key
      } = event;
      this.keyboardInput.set(key, true);
    });
    window.addEventListener("keyup", event => {
      const {
        key
      } = event;
      this.keyboardInput.set(key, false);
    });
  }
  scanGamepads() {
    const browserGamepadSupport = Boolean(navigator.getGamepads) ?? false;
    let gamepads;
    if (browserGamepadSupport) {
      gamepads = navigator.getGamepads();
    } else {
      console.warn("This browser doesn't support gamepads");
      this.hasSupport = false;
      return;
    }
    this.lastConnection = gamepads.length;
  }
  getInputAtIndex(index) {
    const gamepad = navigator.getGamepads()[index];
    const connected = this.connections.get(index);
    const up = this.keyboardInput.get('ArrowUp');
    const down = this.keyboardInput.get('ArrowDown');
    const left = this.keyboardInput.get('ArrowLeft');
    const right = this.keyboardInput.get('ArrowRight');
    const z = this.keyboardInput.get('z');
    const x = this.keyboardInput.get('x');
    let horizontal = right ? 1 : left ? -1 : 0;
    let vertical = up ? -1 : down ? 1 : 0;
    let buttonA = z ? 1 : 0;
    let buttonB = x ? 1 : 0;
    if (!connected || !gamepad) {
      return {
        horizontal: horizontal,
        vertical: vertical,
        buttonA,
        buttonB,
        buttonX: 0,
        buttonY: 0,
        select: 0,
        start: 0
      };
    }
    const [x1, y1] = gamepad.axes;
    horizontal = Math.abs(x1) > 0.1 ? x1 : horizontal;
    vertical = Math.abs(y1) > 0.1 ? y1 : vertical;
    buttonA = gamepad.buttons[0].value || buttonA;
    buttonB = gamepad.buttons[1].value || buttonB;
    return {
      horizontal,
      vertical,
      buttonA,
      buttonB,
      buttonX: 0,
      buttonY: 0,
      select: 0,
      start: 0
    };
  }
  getInputs() {
    return [this.getInputAtIndex(0)];
  }
}

async function createActor(target, stage) {
  const loader = new ActorLoader();
  const payload = await loader.load(target.options.files);
  const actor = new PyramidActor({
    stage,
    payload
  });
  stage.children.set(actor.id, actor);
  // TODO: condition for player
  stage.players.set(actor.id, actor);
  return actor;
}
function Loaders(stage) {
  return {
    createActor: async options => {
      return await createActor(options, stage);
    }
  };
}

function Game(app) {
  return target => {
    const gameInstance = new target();
    const pyramidInstance = new PyramidGame({
      loop: gameInstance.loop.bind(gameInstance),
      setup: gameInstance.setup.bind(gameInstance)
    });
    pyramidInstance.ready.then(() => {
      app.appendChild(pyramidInstance.domElement());
      gameInstance.ready.bind(gameInstance)();
    });
  };
}
class PyramidGame {
  stages = [];
  currentStage = 0;
  constructor({
    loop,
    setup
  }) {
    this.gamepad = new Gamepad();
    this.clock = new THREE.Clock();
    this._loop = loop;
    this._setup = setup;
    this.ready = new Promise(async (resolve, reject) => {
      try {
        const world = await this.loadPhysics();
        this.stages.push(new Stage(world));
        await this.gameSetup();
        const self = this;
        requestAnimationFrame(() => {
          self.gameLoop(self);
        });
        resolve(true);
      } catch (error) {
        reject(error);
      }
    });
  }
  async loadPhysics() {
    await RAPIER__default["default"].init();
    const world = new RAPIER__default["default"].World({
      x: 0.0,
      y: -9.81,
      z: 0.0
    });
    return world;
  }

  /**
   * Main game loop
   * process user input
   * update physics
   * render scene
   */
  async gameLoop(self) {
    const inputs = this.gamepad.getInputs();
    const ticks = this.clock.getDelta();
    this.stage().update(ticks);
    const player = this.stage().getPlayer() ?? {
      move: () => {}
    };
    this._loop({
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
    const commands = Create(this.stage());
    const primitives = Primitives(this.stage());
    const triggers = Triggers(this.stage());
    const loaders = Loaders(this.stage());
    this._setup({
      commands,
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

class Globals {
  constructor(state) {
    this.history = new stateshot.History();
    this.history.pushSync(state);
  }
  update(state) {
    const current = this.current();
    this.history.pushSync({
      ...current,
      ...state
    });
  }
  current() {
    return this.history.get();
  }
}

class Menu {
  constructor() {
    console.log('new menu');
  }
}

const Pyramid = {
  Debug,
  Game,
  Gamepad,
  Globals,
  Menu,
  Stage,
  Entity: {
    Actor,
    Primitives,
    Collision
  },
  Util
};

exports["default"] = Pyramid;
