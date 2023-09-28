import mapboxgl, { CustomLayerInterface, Map } from "mapbox-gl";
import * as THREE from "three";
import { setMap } from "../../Mapbox/utils/data";
import { ICommonData } from "../common/dataLoader";
import Scene from "../common/Scene";
import sceneLoader from "../common/sceneLoader";
import initMapbox from "./init-mapbox";

export async function init(container: HTMLElement, data: ICommonData): Promise<Scene> {
    return new Promise(async (resolve, reject) => {
        var { geoConfig } = data;

        const map = await initMapbox(container, geoConfig.style);
        setMap(map);

        let camera: THREE.PerspectiveCamera;
        let scene: Scene;
        let renderer: THREE.WebGLRenderer;

        let l: THREE.Matrix4;

        map.setBearing(geoConfig.bearing + 35);
        map.setCenter(geoConfig.center);
        map.setZoom(16);

        const modelAltitude = 1;
        const modelRotate = [0, 0, ((180 - geoConfig.bearing) * Math.PI) / 180];
        const modelAsMercatorCoordinate = mapboxgl.MercatorCoordinate.fromLngLat(geoConfig.center, modelAltitude);
        const modelTransform = {
            translateX: modelAsMercatorCoordinate.x,
            translateY: modelAsMercatorCoordinate.y,
            translateZ: modelAsMercatorCoordinate.z,
            rotateX: modelRotate[0],
            rotateY: modelRotate[1],
            rotateZ: modelRotate[2],
            scale: 10 * modelAsMercatorCoordinate.meterInMercatorCoordinateUnits(),
        };

        const customLayer: CustomLayerInterface = {
            id: "3d-expofp",
            type: "custom",
            renderingMode: "3d",
            onAdd: async function (map: Map, gl: WebGLRenderingContext) {
                camera = new THREE.PerspectiveCamera();

                var res = await sceneLoader(
                    map.getCanvas(),
                    gl,
                    container,
                    camera,
                    (x: number, y: number, raycaster: THREE.Raycaster) => {
                        const freeCamera = map.getFreeCameraOptions();
                        let cameraPosition = new THREE.Vector4(
                            freeCamera.position.x,
                            freeCamera.position.y,
                            freeCamera.position.z,
                            1
                        );
                        const mouse = new THREE.Vector4(-1000, -1000, 1, 1);

                        mouse.x = (x / container.clientWidth) * 2 - 1;
                        mouse.y = -(y / container.clientHeight) * 2 + 1;

                        cameraPosition.applyMatrix4(l.invert());
                        let direction = mouse.clone().applyMatrix4(camera.projectionMatrix.clone().invert());
                        direction.divideScalar(direction.w);
                        raycaster.set(cameraPosition as any, direction.sub(cameraPosition).normalize() as any);
                        return raycaster;
                    },
                    () => {}
                );

                scene = res.scene;
                renderer = res.renderer;

                resolve(scene);
            },

            render: function (gl: WebGLRenderingContext, matrix: number[]) {
                if (!renderer) return;
                const rotationX = new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(1, 0, 0), modelTransform.rotateX);
                const rotationY = new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(0, 1, 0), modelTransform.rotateY);
                const rotationZ = new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(0, 0, 1), modelTransform.rotateZ);

                const m = new THREE.Matrix4().fromArray(matrix);

                l = new THREE.Matrix4()
                    .makeTranslation(modelTransform.translateX, modelTransform.translateY, modelTransform.translateZ)
                    .scale(new THREE.Vector3(modelTransform.scale, -modelTransform.scale, modelTransform.scale))
                    .multiply(rotationX)
                    .multiply(rotationY)
                    .multiply(rotationZ);

                camera.projectionMatrix = m.multiply(l);

                const freeCamera = map.getFreeCameraOptions();
                let cameraPosition = new THREE.Vector4(
                    freeCamera.position.x,
                    freeCamera.position.y,
                    freeCamera.position.z,
                    1
                ).applyMatrix4(l.clone().invert());

                camera.userData.position = cameraPosition;

                renderer.render(scene, camera);

                map.triggerRepaint();
            },
        };

        map.addLayer(customLayer);
    });
}
