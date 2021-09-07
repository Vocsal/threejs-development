console.log("%cThreejs Sphere Model Example.", "background-color: orange; padding: 4px; border-radius: 4px; color: white;");

import "./index.scss";
import * as THREE from "three";
import Base from "src/core/base";

class Example extends Base {
    sphere!: THREE.Mesh;
    lightPosition!: THREE.Vector3;

    constructor(sel: string, debug: boolean) {
        super(sel, debug);
        this.perspectiveCameraParams = {
            fov: 60,
            near: 0.1,
            far: 2000
        };
        this.orthographicCameraParams = {
            zoom: 2,
            near: -100,
            far: 1000
        };
        this.cameraPosition = new THREE.Vector3(400, 400, 400);
        this.lightPosition = new THREE.Vector3(300, 300, -300);
    }

    init() {
        this.createScene(600); // 创建场景
        this.createPerspectiveCamera(); // 创建透视相机
        // this.createOrthographicCamera();
        this.createRenderer(); // 创建渲染器
        this.createSphere();
        this.createFloor();
        this.createLight(); // 创建光
        this.createOrbitControls(); // 创建轨道控制器
        this.addListeners(); // 添加监听器
        this.setLoop(); // 设置循环
    }

    createRenderer() {
        super.createRenderer();
        this.renderer.shadowMap.enabled = true;
    }

    createSphere() {
        const sphere = this.createMesh({
            geometry: new THREE.SphereGeometry(100, 50, 50),
            material: new THREE.MeshLambertMaterial({
                color: 0x156289,
            }),
            position: new THREE.Vector3(0, 120, 0)
        })
        sphere.castShadow = true;
        this.sphere = sphere;

        const sphere2 = sphere.clone();
        sphere2.position.y = - sphere.position.y;
        this.scene.add(sphere2);

        // const sphere3 = sphere.clone();
        // sphere3.position.copy(this.lightPosition);
        // this.scene.add(sphere3);
    }

    createFloor() {
        const floor = this.createMesh({
            geometry: new THREE.PlaneGeometry(2000, 2000),
            material: new THREE.MeshStandardMaterial({
                color: 0xffffff,
                side: THREE.DoubleSide,
            })
        })
        floor.rotation.x = - Math.PI / 2;
        floor.receiveShadow = true;
        this.scene.add(floor);
    }

    createLight() {
        const pointLight = new THREE.PointLight(0xffffff, 0.8);
        pointLight.castShadow = true;
        pointLight.position.copy(this.lightPosition);
        this.scene.add(pointLight);
        pointLight.shadow.mapSize.width = 2000;
        pointLight.shadow.mapSize.height = 2000;
        pointLight.shadow.camera.near = 1;
        pointLight.shadow.camera.far = 2000;
        pointLight.shadow.radius = 10;

        const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.2);
        this.scene.add(hemisphereLight);
    }

    update() {}
}


const sel = "#sphere";
const debug = true;
const example = new Example(sel, debug);
example.init();