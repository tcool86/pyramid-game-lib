import * as THREE from "three"
import { WebGLRenderer, WebGLRenderTarget } from "three"
import { Pass, FullScreenQuad } from "three/examples/jsm/postprocessing/Pass"

export default class RenderWobblyPass extends Pass {
	fsQuad: FullScreenQuad;
	resolution: THREE.Vector2;
	scene: THREE.Scene;
	camera: THREE.Camera;
	rgbRenderTarget: WebGLRenderTarget;
	normalRenderTarget: WebGLRenderTarget;
	normalMaterial: THREE.Material;
	clock: THREE.Clock;

	constructor(resolution: THREE.Vector2, scene: THREE.Scene, camera: THREE.Camera) {
		super();
		this.clock = new THREE.Clock();
		this.resolution = resolution;
		this.fsQuad = new FullScreenQuad(this.material());
		this.scene = scene;
		this.camera = camera;
		this.rgbRenderTarget = new THREE.WebGLRenderTarget(resolution.width, resolution.height);
		this.normalRenderTarget = new THREE.WebGLRenderTarget(resolution.width, resolution.height);
		this.normalMaterial = new THREE.MeshNormalMaterial();
	}

	render(
		renderer: WebGLRenderer,
		writeBuffer: WebGLRenderTarget
	) {
		renderer.setRenderTarget(this.rgbRenderTarget)
		renderer.render(this.scene, this.camera)

		const overrideMaterial_old = this.scene.overrideMaterial
		renderer.setRenderTarget(this.normalRenderTarget)
		this.scene.overrideMaterial = this.normalMaterial
		renderer.render(this.scene, this.camera)
		this.scene.overrideMaterial = overrideMaterial_old

		// @ts-ignore
		const uniforms = this.fsQuad.material.uniforms
		uniforms.tDiffuse.value = this.rgbRenderTarget.texture
		uniforms.tDepth.value = this.rgbRenderTarget.depthTexture
		uniforms.tNormal.value = this.normalRenderTarget.texture

		if (this.renderToScreen) {
			renderer.setRenderTarget(null)
		} else {
			renderer.setRenderTarget(writeBuffer)
			if (this.clear) renderer.clear()
		}
		this.fsQuad.render(renderer)
	}

	material() {
		const shaderMaterial = new THREE.ShaderMaterial({
			uniforms: {
				time: { value: 1.0 },
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
			vertexShader: `
				uniform float time;
				varying vec2 vUv;
				varying vec3 pos;

				void main() {
					vUv = uv;

					vUv.x += sin(time * 1.0f)/20.0f;
					vUv.y += cos(time * 1.0f)/20.0f;

					pos.x = sin(time) * position.x/100.0f;
					pos.y = cos(time) * position.y/100.0f;

					gl_Position = projectionMatrix * modelViewMatrix * vec4( position - pos, 1.0 );
				}
			`,
			fragmentShader: `
				uniform float time;
				uniform sampler2D tDiffuse;
				uniform sampler2D tDepth;
				uniform sampler2D tNormal;
				uniform vec4 resolution;
				varying vec2 vUv;

				void main() {
					vec4 texel = texture2D( tDiffuse, vUv );
					float coefficient = 1.0f;
					gl_FragColor = texel * coefficient;
				}
			`
		});
		setInterval(() => {
			shaderMaterial.uniforms['time'].value = this.clock.getElapsedTime();
		}, 0);
		return shaderMaterial;
	}
}