import * as THREE from "three";
import { WebGLRenderer, WebGLRenderTarget } from "three";
import { Pass, FullScreenQuad } from "three/examples/jsm/postprocessing/Pass";
export default class RenderPass extends Pass {
    fsQuad: FullScreenQuad;
    resolution: THREE.Vector2;
    scene: THREE.Scene;
    camera: THREE.Camera;
    rgbRenderTarget: WebGLRenderTarget;
    normalRenderTarget: WebGLRenderTarget;
    normalMaterial: THREE.Material;
    constructor(resolution: THREE.Vector2, scene: THREE.Scene, camera: THREE.Camera);
    render(renderer: WebGLRenderer, writeBuffer: WebGLRenderTarget): void;
    material(): THREE.ShaderMaterial;
}
