import RAPIER, { RigidBodyType, Vector3 as Vector3$1 } from '@dimforge/rapier3d-compat';
import * as THREE from 'three';
import { WebGLRenderTarget, Clock, Color, PointLight } from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Pass, FullScreenQuad } from 'three/examples/jsm/postprocessing/Pass';
import { History } from 'stateshot';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';

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

/* babel-plugin-inline-import './fragment-shaders/standard.fx' */
const fragmentShader = "uniform sampler2D tDiffuse;\nvarying vec2 vUv;\n\nvoid main() {\n\tvec4 texel = texture2D( tDiffuse, vUv );\n\n\tgl_FragColor = texel;\n}";
/* babel-plugin-inline-import './vertex-shaders/standard.fx' */
const vertexShader = "varying vec2 vUv;\n\nvoid main() {\n\tvUv = uv;\n\tgl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n}";
class RenderPass extends Pass {
  constructor(resolution, scene, camera) {
    super();
    this.resolution = resolution;
    this.fsQuad = new FullScreenQuad(this.material());
    this.scene = scene;
    this.camera = camera;
    this.rgbRenderTarget = new WebGLRenderTarget(resolution.x * 4, resolution.y * 4);
    this.normalRenderTarget = new WebGLRenderTarget(resolution.x * 4, resolution.y * 4);
    this.normalMaterial = new THREE.MeshNormalMaterial();
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
    return new THREE.ShaderMaterial({
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
          value: new THREE.Vector4(this.resolution.x, this.resolution.y, 1 / this.resolution.x, 1 / this.resolution.y)
        }
      },
      vertexShader: vertexShader,
      fragmentShader: fragmentShader
    });
  }
}

// TODO: types here seem unecessary

function classType(classInstance) {
  if (!(typeof classInstance?.constructor === 'function')) {
    return null;
  }
  return classInstance.constructor.name;
}
function determineEntity(classInstance) {
  if (classType(classInstance) !== null) {
    return classInstance._create;
  }
}
async function createInternal(classInstance, parameters, stage) {
  const fn = determineEntity(classInstance);
  if (classType(classInstance) !== null) {
    return fn({
      classInstance: classInstance,
      parameters,
      stage
    });
  }
  return fn(classInstance, stage);
}
async function Create(stage) {
  return {
    create: async (entityClass, parameters = {}) => {
      // create exposed to consumer
      const classInstance = new entityClass();
      return await createInternal(classInstance, parameters, stage);
    }
  };
}

class Stage {
  constructor(world) {
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
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.name = 'Light';
    directionalLight.position.set(0, 100, 0);
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.near = 0.1;
    directionalLight.shadow.camera.far = 2000;
    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;
    scene.add(directionalLight);

    // scene.add(new THREE.CameraHelper(spotLight.shadow.camera));

    const renderer = new THREE.WebGLRenderer({
      antialias: false
    });
    renderer.setSize(screenResolution.x, screenResolution.y);
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(renderResolution, scene, camera));
    const controls = new OrbitControls(camera, renderer.domElement);
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
  addChild(id, child) {
    if (child._setup) {
      const commands = Create(this);
      child._setup({
        entity: child,
        commands
      });
    }
    this.children.set(id, child);
  }
  update({
    delta,
    inputs
  }) {
    this.world.step();
    const entityIterator = this.children.entries();
    let entityWrapper;
    while (entityWrapper = entityIterator.next().value) {
      const [, entity] = entityWrapper;
      entity.update({
        delta,
        inputs
      });
      const {
        _ref
      } = entity;
      if (_ref.__proto__._collision) ;
    }
    this.updateColliders();
  }
  updateColliders() {
    if (!this.players) return;
    for (let [, player] of this.players) {
      const {
        _ref
      } = player;
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
        }
        const entity = this.children.get(id);
        const material = entity.debug?.material;
        material.color?.set(0x009900);
        const collisionHandler = _ref.__proto__._collision.get(entity.collisionKey);
        if (collisionHandler) {
          const {
            name,
            original
          } = collisionHandler;
          original.bind(_ref)({
            entity: player,
            target: entity
          });
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
}

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

function Game({
  app,
  globals
}) {
  return target => {
    const gameInstance = new target();
    const pyramidInstance = new PyramidGame({
      loop: gameInstance.loop.bind(gameInstance),
      setup: gameInstance.setup.bind(gameInstance),
      globals: globals
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
    setup,
    globals
  }) {
    this.gamepad = new Gamepad();
    this.clock = new Clock();
    this._loop = loop;
    this._setup = setup;
    this._globals = globals;
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
    await RAPIER.init();
    const world = new RAPIER.World({
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
    this.stage().update({
      delta: ticks,
      inputs
    });
    this._loop({
      ticks,
      inputs,
      stage: this.stage(),
      globals: this._globals
    });
    this.stage().render();
    requestAnimationFrame(() => {
      self.gameLoop(self);
    });
  }
  async gameSetup() {
    const commands = Create(this.stage());
    this._setup({
      commands,
      globals: this._globals
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
    this.history = new History();
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

class Vector3 extends THREE.Vector3 {
  constructor(x, y, z) {
    super();
    this.x = x ?? 0;
    this.y = y ?? 0;
    this.z = z ?? 0;
  }
}
class Vector2 extends THREE.Vector2 {
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
    const geometry = new THREE.BoxGeometry(size.x, size.y, size.z);
    this.mesh = new THREE.Mesh(geometry, this.material);
    this.mesh.position.set(position.x, position.y, position.z);
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;
    scene.add(this.mesh);
    this.createDebugMesh(geometry, position);
  }
  sphericalMesh(radius, position) {
    const {
      scene
    } = this.stageRef;
    const geometry = new THREE.SphereGeometry(radius);
    this.mesh = new THREE.Mesh(geometry, this.material);
    this.mesh.position.set(position.x, position.y, position.z);
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;
    scene.add(this.mesh);
    this.createDebugMesh(geometry, position);
  }
  noMesh() {}
  createDebugMesh(geometry, position, color = 0xFFFFFF) {
    const {
      scene
    } = this.stageRef;
    const debugMaterial = new THREE.MeshPhongMaterial({
      color: new THREE.Color(color)
    });
    debugMaterial.wireframe = true;
    debugMaterial.needsUpdate = true;
    this.debugColor = color;
    this.debug = new THREE.Mesh(geometry, debugMaterial);
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
    const rigidBodyDesc = RAPIER.RigidBodyDesc.dynamic().setTranslation(x, y, z);
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
    let colliderDesc = RAPIER.ColliderDesc.cuboid(half.x, half.y, half.z);
    colliderDesc.setSensor(isSensor);
    if (isSensor) {
      // "KINEMATIC_FIXED" will only sense actors moving through the sensor
      colliderDesc.activeCollisionTypes = RAPIER.ActiveCollisionTypes.KINEMATIC_FIXED;
      // colliderDesc.setActiveHooks(RAPIER.ActiveHooks.FILTER_INTERSECTION_PAIRS);
    }

    world.createCollider(colliderDesc, this.body);
  }
  collisionSpherical(radius, isSensor = false) {
    const {
      world
    } = this.stageRef;
    let colliderDesc = RAPIER.ColliderDesc.ball(radius);
    colliderDesc.setSensor(isSensor);
    world.createCollider(colliderDesc, this.body);
  }
  collisionCustomGeometry(geometry) {
    const {
      world
    } = this.stageRef;
    geometry.computeBoundingBox();
    let hitBox = geometry.boundingBox;
    let size = new THREE.Vector3();
    hitBox?.getSize(size);
    let sphere = new THREE.Sphere();
    hitBox?.getBoundingSphere(sphere);
    let colliderDesc = RAPIER.ColliderDesc.capsule(size.y / 4, sphere.radius / 4);
    colliderDesc.setTranslation(0, 1, 0);
    this.body.setTranslation(new RAPIER.Vector3(0, size.y / 4, 0), true);
    world.createCollider(colliderDesc, this.body);
    this.createDebugMesh(geometry, new Vector3(), 0xFFff00);
  }
  collisionStatic() {
    this.body.setBodyType(RAPIER.RigidBodyType.Fixed);
  }
  setRotation(x = 0, y = 0, z = 0) {
    this.body.setRotation({
      x,
      y,
      z,
      w: 1
    }, true);
  }
  rotateX(amount) {
    const current = this.body.rotation();
    this.setRotation(current.x + amount, 0, 0);
  }
  rotateY(amount) {
    const current = this.body.rotation();
    this.setRotation(0, current.y + amount, 0);
  }
  rotateZ(amount) {
    const current = this.body.rotation();
    this.setRotation(0, 0, current.z + amount);
  }
  angularVelocity(vector) {
    this.body.setAngvel(vector, true);
  }
  applyMaterial(texturePath, color, repeat) {
    let material;
    if (texturePath) {
      const loader = new THREE.TextureLoader();
      loader.setPath('');
      const texture = loader.load(texturePath);
      texture.repeat = repeat;
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      material = new THREE.MeshPhongMaterial({
        color: color,
        map: texture
        // bumpMap: texture,
        // bumpScale: 0.3
      });
    } else {
      material = new THREE.MeshStandardMaterial({
        color: color,
        emissiveIntensity: 0.5,
        lightMapIntensity: 0.5,
        fog: true
      });
    }
    this.material = material;
  }
  update({
    delta,
    inputs
  }) {
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
      this._loop({
        entity: this,
        delta,
        inputs
      });
    }
  }
}
Entity.prototype.toString = function () {
  let output = '';
  output += `id: ${this.id}\n`;
  output += `tag: ${this.tag}\n`;
  output += `body: ${this.body.handle}\n`;
  output += `mesh: ${this?.mesh?.uuid}\n`;
  output += `debug mesh: ${this?.debug?.uuid}\n`;
  return output;
};

class ActorLoader {
  constructor() {
    this.fbxLoader = new FBXLoader();
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
          this.mixer = new THREE.AnimationMixer(object);
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
async function createActor({
  classInstance,
  parameters,
  stage
}) {
  const loader = new ActorLoader();
  const {
    _options,
    constructor
  } = classInstance;
  const {
    name
  } = constructor;
  const payload = await loader.load(_options.files);
  const actor = new PyramidActor({
    stage,
    payload,
    tag: name
  });
  if (classInstance.loop) {
    actor._loop = classInstance.loop.bind(classInstance);
  }
  if (classInstance.setup) {
    actor._setup = classInstance.setup.bind(classInstance);
  }
  actor._ref = classInstance;
  stage.addChild(actor.id, actor);

  // TODO: for now all actors are considered "players"
  stage.players.set(actor.id, actor);
  return actor;
}
function Actor(options) {
  return target => {
    target.prototype._create = createActor;
    target.prototype._options = options;
  };
}
class PyramidActor extends Entity {
  actions = [];
  constructor({
    stage,
    payload,
    tag
  }) {
    super(stage, tag);
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
    this.body.setBodyType(RigidBodyType.KinematicVelocityBased);
    stage.scene.add(this.object);
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
    const euler = new THREE.Euler(x, y, z);
    this.object.setRotationFromEuler(euler);
  }
  rotateX(amount) {
    this.rotate(new Vector3$1(amount, 0, 0));
  }
  rotateY(amount) {
    this.rotate(new Vector3$1(0, -amount, 0));
  }
  rotateZ(amount) {
    this.rotate(new Vector3$1(0, 0, amount));
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
  update({
    delta,
    inputs
  }) {
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
    super.update({
      delta,
      inputs
    });
  }
}

function Collision(key) {
  return (target, name, descriptor) => {
    const original = descriptor.value;
    target._collision ??= new Map();
    target._collision.set(key, {
      name,
      original
    });
  };
}

function Box(options) {
  return target => {
    target.prototype._options = options;
    target.prototype._create = createBox;
  };
}
const boxDefaults = {
  debugColor: Color.NAMES.white,
  showDebug: false,
  position: new Vector3(0, 0, 0),
  width: 1,
  height: 1,
  depth: 1,
  color: Color.NAMES.white,
  texturePath: null,
  textureSize: new Vector2(1, 1)
};
function createBox({
  classInstance,
  parameters,
  stage
}) {
  const {
    _options,
    constructor
  } = classInstance;
  // TODO: do all objects added to the stage via create share this?
  const entity = new Entity(stage, constructor.name);
  if (classInstance.loop) {
    entity._loop = classInstance.loop.bind(classInstance);
  }
  if (classInstance.setup) {
    entity._setup = classInstance.setup.bind(classInstance);
  }
  entity._ref = classInstance;
  const options = Object.assign({}, boxDefaults, _options, parameters);
  const {
    width,
    height,
    depth
  } = options;
  const size = new Vector3(width, height, depth);
  const position = options.position;
  const color = options.color;
  const texturePath = options.texturePath;
  const textureSize = options.textureSize;
  entity.applyMaterial(texturePath, color, textureSize);
  entity.rectangularMesh(size, position);
  entity.createBody(position);
  entity.collisionRectangular(size);
  entity.body.setAdditionalMass(0.02, true);
  entity.body.setAngularDamping(0.1);
  if (options?.fixed) {
    entity.collisionStatic();
  }
  entity.debugColor = options.debugColor;
  entity.showDebug = options.showDebug;
  entity.collisionKey = options?.collisionKey;
  stage.addChild(entity.id, entity);
  return entity;
}

function Sphere(options) {
  return target => {
    target.prototype._options = options;
    target.prototype._create = createSphere;
  };
}
const sphereDefaults = {
  debugColor: Color.NAMES.white,
  showDebug: false,
  position: new Vector3(0, 0, 0),
  radius: 1,
  color: Color.NAMES.white,
  texturePath: null,
  textureSize: new Vector2(1, 1),
  glow: false
};
function createSphere({
  classInstance,
  parameters,
  stage
}) {
  const {
    _options,
    constructor
  } = classInstance;
  const entity = new Entity(stage, constructor.name);
  if (classInstance.loop) {
    entity._loop = classInstance.loop.bind(classInstance);
  }
  if (classInstance.setup) {
    entity._setup = classInstance.setup.bind(classInstance);
  }
  entity._ref = classInstance;
  const options = Object.assign({}, sphereDefaults, _options, parameters);
  const radius = options.radius;
  const position = options.position;
  const color = options.color;
  const texturePath = options.texturePath;
  const textureSize = options.textureSize;
  entity.applyMaterial(texturePath, color, textureSize);
  entity.sphericalMesh(radius, position);
  entity.createBody(position);
  entity.collisionSpherical(radius, options.isSensor);
  entity.body.setAdditionalMass(0.02, true);
  entity.body.setAngularDamping(0.1);
  entity.debugColor = options.debugColor;
  entity.showDebug = options.showDebug;
  if (options.glow) {
    // TODO: give more customizable options for "glow"
    const light = new PointLight(color, 1, 100);
    light.position.set(0, 0, 0);
    entity.mesh?.add(light);
  }
  stage.addChild(entity.id, entity);
  return entity;
}

function Trigger(options) {
  return target => {
    target.prototype._options = options;
    target.prototype._create = createAreaTrigger;
  };
}
const triggerDefaults = {
  debugColor: Color.NAMES.white,
  showDebug: false,
  position: new Vector3(0, 0, 0),
  onEnter: () => {},
  onExit: () => {}
};
function createAreaTrigger({
  classInstance,
  parameters,
  stage
}) {
  const {
    _options,
    constructor
  } = classInstance;
  const entity = new Entity(stage, constructor.name);
  if (classInstance.loop) {
    entity._loop = classInstance.loop.bind(classInstance);
  }
  if (classInstance.setup) {
    entity._setup = classInstance.setup.bind(classInstance);
  }
  entity._ref = classInstance;
  const options = Object.assign({}, triggerDefaults, _options, parameters);
  const {
    width,
    height,
    depth
  } = options;
  const size = new Vector3(width, height, depth);
  const position = options.position;
  const color = options.debugColor;
  const geometry = new THREE.BoxGeometry(width, height, depth);
  entity.createDebugMesh(geometry, position, color);
  entity.createBody(position);
  entity.collisionRectangular(size, true);
  entity.collisionStatic();
  entity.showDebug = options.showDebug;
  entity.onEnter = options.onEnter;
  entity.onExit = options.onExit;
  stage.addChild(entity.id, entity);
  stage.triggers.set(entity.id, entity);
  return entity;
}

const metal = new THREE.Material();
const Materials = {
  metal
};

const Pyramid = {
  Debug,
  Game,
  Gamepad,
  Globals,
  Menu,
  Stage,
  Entity: {
    Actor,
    Collision,
    Materials,
    Box,
    Sphere,
    Trigger
  },
  Util
};

export { Pyramid as default };
