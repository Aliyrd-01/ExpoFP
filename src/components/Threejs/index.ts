import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import Scene from "./common/Scene";
import { ICommonData } from "./common/dataLoader";
import sceneLoader from "./common/sceneLoader";

export default function init(container: HTMLElement, data: ICommonData): Promise<Scene> {
    return new Promise(async (resolve, reject) => {
        const camera = new THREE.PerspectiveCamera(50, container.clientWidth / container.clientHeight, 0.1, 1000);

        var { x, y } = data.viewbox.center;

        camera.position.x = x + data.area.width * 0.2;
        camera.position.y = y + data.area.height;
        camera.position.z =
            data.objLayers[data.objLayers.length - 1].z * Math.max(data.area.height, data.area.width) * 0.15 ||
            Math.min(data.area.height, data.area.width);

        camera.up.set(0, 0, 1);

        let controls: OrbitControls;

        const res = await sceneLoader(
            null,
            null,
            container,
            camera,
            (x: number, y: number, raycaster: THREE.Raycaster) => {
                const pointer = new THREE.Vector2();
                pointer.x = (x / container.clientWidth) * 2 - 1;
                pointer.y = -(y / container.clientHeight) * 2 + 1;
                raycaster.setFromCamera(pointer, camera);
            },
            () => {
                controls?.update();
            }
        );

        controls = new OrbitControls(camera, res.renderer.domElement);
        controls.enableRotate = true;
        controls.enablePan = true;
        controls.enableZoom = true;
        controls.enableDamping = true;
        controls.zoomSpeed = 0.7;
        controls.rotateSpeed = 1.5;
        controls.panSpeed = 0.7;
        controls.target.set(x, y, 0);
        controls.mouseButtons = {
            LEFT: THREE.MOUSE.PAN,
            RIGHT: THREE.MOUSE.ROTATE,
            MIDDLE: THREE.MOUSE.DOLLY,
        };

        controls.touches.ONE = THREE.TOUCH.PAN;
        controls.touches.TWO = THREE.TOUCH.DOLLY_ROTATE;

        res.scene.background = new THREE.Color(0xc4c4c4);
        resolve(res.scene);
    });
}
