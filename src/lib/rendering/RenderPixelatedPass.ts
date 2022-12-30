import * as THREE from "three"
import * as fragmentShader from './fragment-shaders/pixelated.fx';
import * as vertexShader from './vertex-shaders/standard.fx';
import { WebGLRenderer, WebGLRenderTarget } from "three"
import { Pass, FullScreenQuad } from "three/examples/jsm/postprocessing/Pass"

export default class RenderPixelatedPass extends Pass {
	fsQuad: FullScreenQuad
	resolution: THREE.Vector2
	scene: THREE.Scene
	camera: THREE.Camera
	rgbRenderTarget: WebGLRenderTarget
	normalRenderTarget: WebGLRenderTarget
	normalMaterial: THREE.Material

	constructor(resolution: THREE.Vector2, scene: THREE.Scene, camera: THREE.Camera) {
		super();
		this.resolution = resolution;
		this.fsQuad = new FullScreenQuad(this.material());
		this.scene = scene;
		this.camera = camera;

		this.rgbRenderTarget = pixelRenderTarget(resolution, THREE.RGBAFormat, true);
		this.normalRenderTarget = pixelRenderTarget(resolution, THREE.RGBAFormat, false);

		this.normalMaterial = new THREE.MeshNormalMaterial();
		console.log(fragmentShader);
	}

	render(
		renderer: WebGLRenderer,
		writeBuffer: WebGLRenderTarget
	) {
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
				tDiffuse: { value: null },
				tDepth: { value: null },
				tNormal: { value: null },
				resolution: {
					value: new THREE.Vector4(
						this.resolution.x,
						this.resolution.y,
						1 / this.resolution.x,
						1 / this.resolution.y,
					)
				}
			},
			vertexShader: vertexShader,
			fragmentShader: fragmentShader,
		});
	}
}

function pixelRenderTarget(resolution: THREE.Vector2, pixelFormat: THREE.PixelFormat, depthTexture: boolean) {
	const renderTarget = new WebGLRenderTarget(
		resolution.x, resolution.y,
		!depthTexture ?
			undefined
			: {
				depthTexture: new THREE.DepthTexture(
					resolution.x,
					resolution.y
				),
				depthBuffer: true
			}
	);
	renderTarget.texture.format = pixelFormat;
	renderTarget.texture.minFilter = THREE.NearestFilter;
	renderTarget.texture.magFilter = THREE.NearestFilter;
	renderTarget.texture.generateMipmaps = false;
	renderTarget.stencilBuffer = false;
	return renderTarget;
}
