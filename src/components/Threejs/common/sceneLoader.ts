import * as THREE from "three";
import { MeshPhongMaterial } from "three";
import { ICommonData } from "./dataLoader";
import initTexts from "./initTexts";
import loadModel from "./modelLoader";
import Scene from "./Scene";

let selected: THREE.Mesh[] = [];
const materals: any = {};
const selecterMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000, side: THREE.DoubleSide });
const dimmedMaterial = new THREE.MeshPhongMaterial({ color: 0x777777, side: THREE.DoubleSide });

export default async function sceneLoader(
    expo: string,
    canvas: HTMLCanvasElement,
    gl: WebGLRenderingContext,
    container: HTMLElement,
    camera: THREE.PerspectiveCamera,
    data: ICommonData,
    onclickCallback: (x: number, y: number, raycaster: THREE.Raycaster) => void,
    renderCallback: () => void
): Promise<{ scene: Scene; renderer: THREE.WebGLRenderer }> {
    let model = await loadModel(`models/${expo}/model.obj`, `models/${expo}/model.mtl`);

    const raycaster = new THREE.Raycaster();

    const scene = new Scene();
    scene.raycaster = raycaster;
    scene.camera = camera;

    camera.near = 0.1;
    camera.far = 10000;

    var { x, y } = data.viewbox.center;

    const light = new THREE.HemisphereLight(0xffffff, 10);
    light.castShadow = true;
    light.position.set(x, y, 100);
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

    let layerCounter = 1;

    model.children.forEach((mesh) => {
        var [layer, name] = mesh.name.split(/ (.*)/s);

        if (!scene.userLayers.has(layer)) scene.userLayers.set(layer, layerCounter++);
        mesh.name = name;
        mesh.layers.set(scene.userLayers.get(layer)!);
        camera.layers.enable(scene.userLayers.get(layer));
    });

    raycaster.layers.enableAll();

    data.booths.forEach(
        (booth) => (materals[booth.id] = (model.children.find((ch) => ch.name == booth.id) as THREE.Mesh)?.material)
    );

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

        selected.forEach((mesh) => (mesh.material = materals[mesh.name]));

        const intersections = raycaster
            .intersectObjects(scene.children)
            .filter((ch) => ((ch.object as THREE.Mesh).material as MeshPhongMaterial).visible)
            .sort((a, b) => a.distance - b.distance);
            
        const intersection = intersections[0];

        let name = intersection?.object.name;

        if (name && data.booths.find((b) => name === b.id)) {
            const mesh = intersection.object as THREE.Mesh;
            selected = [mesh];
            mesh.material = selecterMaterial;

            data.booths.forEach((booth) => {
                var mesh = model.getObjectByName(booth.id) as THREE.Mesh;
                if (mesh && mesh.name !== name) mesh.material = dimmedMaterial;
            });
        } else {
            data.booths.forEach((booth) => {
                var mesh = model.getObjectByName(booth.id) as THREE.Mesh;
                if (mesh) mesh.material = materals[booth.id];
            });
        }
    }

    // #endregion mouse interaction

    scene.add(model);
    scene.scale.x = -1;
    initTexts(scene.userLayers, scene, data);

    // const plane = new SpriteMesh(yah);
    // plane.rotateX(Math.PI / 2);
    // scene.add(plane);

    return { scene, renderer };
}
