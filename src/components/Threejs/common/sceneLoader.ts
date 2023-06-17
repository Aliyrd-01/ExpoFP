import * as THREE from "three";
import { MeshPhongMaterial } from "three";
import Scene from "./Scene";

export default async function sceneLoader(
    canvas: HTMLCanvasElement,
    gl: WebGLRenderingContext,
    container: HTMLElement,
    camera: THREE.PerspectiveCamera,
    onclickCallback: (x: number, y: number, raycaster: THREE.Raycaster) => void,
    renderCallback: () => void
): Promise<{ scene: Scene; renderer: THREE.WebGLRenderer }> {
    const raycaster = new THREE.Raycaster();

    const scene = new Scene();
    scene.raycaster = raycaster;
    scene.camera = camera;

    camera.near = 0.1;
    camera.far = 10000;

    const light = new THREE.HemisphereLight(0xffffff, 10);
    light.castShadow = true;
    light.position.set(0, 0, 100);
    scene.add(light);

    const renderer = new THREE.WebGLRenderer({
        canvas: canvas || undefined,
        context: gl || undefined,
        antialias: true,
        precision: "highp",
        premultipliedAlpha: true,
    });

    if (!canvas && !gl) {
        renderer.setSize(window.innerWidth, window.innerHeight);
        container.appendChild(renderer.domElement);
    }

    renderer.autoClear = false;

    window.addEventListener(
        "resize",
        () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
            render();
        },
        false
    );

    function render() {
        renderer.resetState();
        renderCallback();
        if (!canvas && !gl) renderer.render(scene, camera);
    }

    function animate() {
        requestAnimationFrame(animate);
        render();
    }

    animate();

    raycaster.layers.enableAll();

    let pressed = false;

    // #region mouse interaction

    window.addEventListener("mousedown", () => {
        pressed = true;
    });

    window.addEventListener("mousemove", () => {
        pressed = false;
    });

    window.addEventListener("mouseup", (event: MouseEvent) => {
        if (pressed) onClick(event.clientX, event.clientY);
        pressed = false;
    });

    function onClick(x: number, y: number) {
        onclickCallback(x, y, raycaster);


        const intersections = raycaster
            .intersectObjects(scene.children)
            .filter((ch) => ((ch.object as THREE.Mesh).material as MeshPhongMaterial).visible)
            .sort((a, b) => a.distance - b.distance);

        console.info(intersections.map((i) => i.object.name));

        scene.onClickCallbacks.forEach((cb) => cb(intersections));
    }

    // #endregion mouse interaction

    scene.scale.x = -1;

    // const plane = new SpriteMesh(yah);
    // plane.rotateX(Math.PI / 2);
    // scene.add(plane);

    return { scene, renderer };
}
