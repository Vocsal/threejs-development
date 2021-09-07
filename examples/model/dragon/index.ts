console.log("%cThreejs Dragon Model Example.", "background-color: orange; padding: 4px; border-radius: 4px; color: white;");

import "./index.scss";
import * as THREE from "three";
import Base from "src/core/Base";
import Dragon from "src/model/Dragon";
const scale = 1;
const sel = "#dragon";
const debug = false;
const backgroundColor = 0x652e37;

class Example extends Base {
    clock!: THREE.Clock;
    dragon!: Dragon;

    constructor(sel: string, debug: boolean = false) {
        super(sel, debug);
        this.clock = new THREE.Clock();

        this.perspectiveCameraParams = { fov: 60, near: 1, far: 2000 };
        this.cameraPosition = new THREE.Vector3(200, 200, -200);
    }

    init() {
        this.createScene(500); // 创建场景
        this.createPerspectiveCamera(); // 创建透视相机
        this.createRenderer(); // 创建渲染器
        this.createFloor();
        this.createDragon();
        this.createLight(); // 创建光
        this.createOrbitControls(); // 创建轨道控制器
        this.addListeners(); // 添加监听器
        this.setLoop(); // 设置循环
    }

    createScene(size: number): void {
        super.createScene(size);
    }

    createRenderer() {
        super.createRenderer();
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
    }

    createFloor() {
        const env = new THREE.Group();
        const floor = new THREE.Mesh(
            new THREE.PlaneGeometry(2000, 2000),
            new THREE.MeshStandardMaterial({
                color: backgroundColor,
            })
        );
        floor.rotation.x = - Math.PI / 2;
        floor.position.y = - 36;
        floor.receiveShadow = true;
        env.add(floor);
        
        this.scene.add(env);
    }

    createDragon() {
        const dragon = new Dragon({
            castShadow: true,
            wingAmplitude: Math.PI / 6,
            wingCircle: 1,
            tailAmplitude: 3,
            tailCircle: 1.5,
        });
        dragon.scale.set(scale, scale, scale);
        this.scene.add(dragon);
        this.dragon = dragon;
        console.log('dragon', dragon)
    }

    createLight() {
        const light = new THREE.HemisphereLight(0xffffff, 0xb3858c, 0.8);
        this.scene.add(light);

        const pointLight = new THREE.PointLight(0xffffff, 0.8);
        pointLight.position.set(200, 100, 100);
        pointLight.castShadow = true;
        this.scene.add(pointLight)
        pointLight.shadow.mapSize.width = 2000;
        pointLight.shadow.mapSize.height = 2000;
        pointLight.shadow.camera.near = 1;
        pointLight.shadow.camera.far = 2000;
        pointLight.shadow.radius = 10;
    }

    update() {
        const delta = this.clock.getDelta();
        this.dragon.run(delta);
    }
}

const example = new Example(sel, debug);
example.init();