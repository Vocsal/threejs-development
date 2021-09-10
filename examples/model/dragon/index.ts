console.log("%cThreejs Dragon Model Example.", "background-color: orange; padding: 4px; border-radius: 4px; color: white;");

import "./index.scss";
import * as THREE from "three";
import gsap from "gsap";
import Base from "src/core/Base";
import Dragon from "src/model/Dragon";
import SmokeParticle from "./SmokeParticle";
const scale = 1;
const sel = "#dragon";
const debug = false;
const backgroundColor = 0x652e37;

class Example extends Base {
    clock!: THREE.Clock;
    dragon!: Dragon;

    wingAngle: number = 0;
    wingAmplitude: number = Math.PI / 6;
    wingCircle: number = 1;
    tailAngle: number = 0;
    tailAmplitude: number = 3;
    tailCircle: number = 1.5;

    powerFiled: HTMLDivElement;
    globalSpeed: number = 1;
    sneezeDelay: number = 700;
    isSneezing: boolean = false;
    maxSneezingRate: number = 8;
    sneezingRate: number = 0;

    timeFire: number = 0;
    fireRate: number = 0;
    timeSmoke: number = 0;

    timeout!: NodeJS.Timeout;

    awaitingSmokeParticles: Array<SmokeParticle> = [];


    constructor(sel: string, debug: boolean = false) {
        super(sel, debug);
        this.clock = new THREE.Clock();

        this.perspectiveCameraParams = { fov: 60, near: 1, far: 2000 };
        this.cameraPosition = new THREE.Vector3( -300, 100, 300);
        this.powerFiled = document.querySelector("#sneeze-power") as HTMLDivElement;
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
        });
        dragon.scale.set(scale, scale, scale);
        this.scene.add(dragon);
        this.dragon = dragon;
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

    createOrbitControls() {
        super.createOrbitControls();
        this.controls.enableZoom = false;
        this.controls.enablePan = false;
    }

    update() {
        const delta = this.clock.getDelta();
        if(!this.isSneezing) {
            this.dragonWaveWings(delta);
            this.dragonWagTail(delta);
        }

        if(this.timeSmoke > 0) {
            const noseTarget = Math.random() > 0.5 ? this.dragon.components.noseL : this.dragon.components.noseR;
            const particle = this.getSmokeParticle();
            const pos = noseTarget.localToWorld(new THREE.Vector3(0, 0, 2));

            particle.mesh.position.set(pos.x, pos.y, pos.z);
            (particle.mesh.material as THREE.MeshLambertMaterial).color.setHex(0x555555);
            (particle.mesh.material as THREE.MeshLambertMaterial).opacity = 0.2;
            this.scene.add(particle.mesh);
            particle.fly();
            this.timeSmoke--;
        }

        if(this.timeFire > 0) {
            const noseTarget = Math.random() > 0.5 ? this.dragon.components.noseL : this.dragon.components.noseR;
            // const colorTarget = Math.random() > 0.5 ? 0xfdde8c : 0xcb3e4c;
            const particle = this.getSmokeParticle();
            const pos = noseTarget.localToWorld(new THREE.Vector3(0, 0, 2));

            particle.mesh.position.set(pos.x, pos.y, pos.z);
            particle.color = {
                r: 255 / 255,
                g: 205 / 255,
                b: 74 / 255,
            };
            (particle.mesh.material as THREE.MeshLambertMaterial).color.setRGB(particle.color.r, particle.color.g, particle.color.b);
            (particle.mesh.material as THREE.MeshLambertMaterial).opacity = 1;

            this.scene.add(particle.mesh);
            particle.fire(this.fireRate);
            this.timeFire --;
        }
    }

    /**
     * @param timeInterval 时间间隔，秒
     */
     dragonWaveWings(timeInterval: number = 0): void {
        const amplitude = this.wingAmplitude;
        const circle = this.wingCircle;
        if(timeInterval === 0 || amplitude === 0 || circle === 0) return;
        this.wingAngle += Math.PI * timeInterval / circle;
        this.dragon.components.wingL.rotation.z = Math.cos(this.wingAngle) * amplitude - Math.PI / 4;
        this.dragon.components.wingR.rotation.z = - Math.cos(this.wingAngle) * amplitude + Math.PI / 4;
    }

    /**
     * @param timeInterval 时间间隔，秒
     */
    dragonWagTail(timeInterval: number = 0): void {
        const amplitude = this.tailAmplitude;
        const circle = this.tailCircle;
        if(timeInterval === 0 || amplitude === 0 || circle === 0) return;
        this.tailAngle += Math.PI * timeInterval / circle;
        const tailLineGeometry = (this.dragon.components.tailLine as THREE.Mesh).geometry;
        const tailLineAttribute = tailLineGeometry.getAttribute('position');
        for( let i = 0; i < tailLineAttribute.count; i++ ) {
            const x = Math.cos( this.tailAngle / 2 + ( Math.PI / 4 ) * i ) * amplitude * i * i;
            const y = Math.sin( this.tailAngle - ( Math.PI / 3 ) * i ) * amplitude * i * i;
            tailLineAttribute.setX(i, x);
            tailLineAttribute.setY(i, y);
            if(i === tailLineAttribute.count - 1) {
                this.dragon.components.tailPike.position.x = x;
                this.dragon.components.tailPike.position.y = y;
                this.dragon.components.tailPike.rotation.x = y / 30;
            }
        }
        tailLineAttribute.needsUpdate = true;
    }

    addListeners() {
        super.addListeners();
        const clickListener = () => {
            if(this.timeout) clearTimeout(this.timeout);
            this.sneezingRate += ( this.maxSneezingRate - this.sneezingRate ) / 10;
            this.powerFiled.innerHTML = parseInt( ( this.sneezingRate * 100 ) / this.maxSneezingRate + '' ) + '';
            this.dragonPrepareToSneeze(this.sneezingRate);
            this.timeout = setTimeout(() => {
                this.dragonSneeze(this.sneezingRate);
                this.sneezingRate = 0;
                this.powerFiled.innerHTML = "00";
            }, this.sneezeDelay * this.globalSpeed);
            this.isSneezing = true;
        }
        window.addEventListener("mouseup", clickListener, false);
        window.addEventListener("touchend", clickListener, false);
    }

    dragonPrepareToSneeze(rate: number = 0) {
        // const speed = 0.7 * this.globalSpeed;
        const speed = (this.sneezeDelay * this.globalSpeed) / 1000;
        const ease = "back.out";

        gsap.to(this.dragon.components.head.rotation, {
            duration: speed,
            x: - rate * 0.12,
            ease,
        })
        gsap.to(this.dragon.components.head.position, {
            duration: speed,
            y: rate * 2.2,
            z: 30 - rate * 2.2,
            ease,
        })

        gsap.to(this.dragon.components.mouth.rotation, {
            duration: speed,
            x: rate * 0.18,
            ease,
        })

        gsap.to(this.dragon.components.smile.position, {
            duration: speed / 2,
            z: 75,
            y: 10,
            ease,
        })
        gsap.to(this.dragon.components.smile.scale, {
            duration: speed / 2,
            x: 0,
            y: 0,
            ease,
        })

        gsap.to(this.dragon.components.noseL.scale, {
            duration: speed,
            x: 1 + rate * 0.1,
            y: 1 + rate * 0.1,
            ease,
        })
        gsap.to(this.dragon.components.noseR.scale, {
            duration: speed,
            x: 1 + rate * 0.1,
            y: 1 + rate * 0.1,
            ease,
        })

        gsap.to(this.dragon.components.eyeL.scale, {
            duration: speed,
            y: 1 + rate * 0.01,
            ease,
        })
        gsap.to(this.dragon.components.eyeR.scale, {
            duration: speed,
            y: 1 + rate * 0.01,
            ease,
        })

        gsap.to(this.dragon.components.irisL.scale, {
            duration: speed,
            y: 1 + rate * 0.05,
            z: 1 + rate * 0.05,
            ease,
        })
        gsap.to(this.dragon.components.irisR.scale, {
            duration: speed,
            y: 1 + rate * 0.05,
            z: 1 + rate * 0.05,
            ease,
        })
        gsap.to(this.dragon.components.irisL.position, {
            duration: speed,
            y: 30 + rate * 0.8,
            z: 24 - rate * 0.4,
            ease,
        })
        gsap.to(this.dragon.components.irisR.position, {
            duration: speed,
            y: 30 + rate * 0.8,
            z: 24 - rate * 0.4,
            ease,
        })

        gsap.to(this.dragon.components.earL.rotation, {
            duration: speed,
            x: - rate * 0.1,
            y: - rate * 0.1,
            ease,
        })
        gsap.to(this.dragon.components.earR.rotation, {
            duration: speed,
            x: - rate * 0.1,
            y: rate * 0.1,
            ease,
        })

        gsap.to(this.dragon.components.wingL.rotation, {
            duration: speed,
            z: - Math.PI / 4 - rate * 0.1,
            ease,
        })
        gsap.to(this.dragon.components.wingR.rotation, {
            duration: speed,
            z: Math.PI / 4 + rate * 0.1,
            ease,
        })

        gsap.to(this.dragon.components.body.rotation, {
            duration: speed,
            x: - rate * 0.05,
            ease,
        })
        gsap.to(this.dragon.components.body.scale, {
            duration: speed,
            y: 1 + rate * 0.01,
            ease,
        })
        gsap.to(this.dragon.components.body.position, {
            duration: speed,
            z: - rate * 2,
            ease,
        })

        gsap.to(this.dragon.components.tail.rotation, {
            duration: speed,
            x: rate * 0.1,
            ease,
        })
    }

    dragonSneeze(rate: number = 0) {
        const sneezeEffect = 1 - rate / this.maxSneezingRate;
        const speed = 0.1 * this.globalSpeed;
        this.timeFire = Math.round( rate * 10 );
        console.log('timeFire', this.timeFire)

        gsap.to(this.dragon.components.head.rotation, {
            duration: speed,
            x: rate * 0.05,
            ease: 'back.out',
        })
        gsap.to(this.dragon.components.head.position, {
            duration: speed,
            z: 30 + rate * 2.4,
            y: - rate * 0.4,
            ease: 'back.out',
        })

        gsap.to(this.dragon.components.mouth.rotation, {
            duration: speed,
            x: 0,
            ease: 'power4.out',
        })

        gsap.to(this.dragon.components.smile.position, {
            duration: speed * 2,
            z: 82,
            y: 5,
            ease: 'power4.in',
        })
        gsap.to(this.dragon.components.smile.scale, {
            duration: speed * 2,
            x: 1,
            y: 1,
            ease: 'power4.in',
        })
        
        gsap.to(this.dragon.components.noseL.scale, {
            duration: speed,
            y: sneezeEffect,
            ease: 'power4.out',
        })
        gsap.to(this.dragon.components.noseR.scale, {
            duration: speed,
            y: sneezeEffect,
            ease: 'power4.out',
        })
        gsap.to(this.dragon.components.noseL.position, {
            duration: speed,
            y: 40, // - ( sneezeEffect * 5 ),
            ease: 'power4.out',
        })
        gsap.to(this.dragon.components.noseR.position, {
            duration: speed,
            y: 40, // - ( sneezeEffect * 5 ),
            ease: 'power4.out',
        })

        gsap.to(this.dragon.components.irisL.scale, {
            duration: speed,
            y: sneezeEffect / 2,
            z: 1,
            ease: 'power4.out',
        })
        gsap.to(this.dragon.components.irisR.scale, {
            duration: speed,
            y: sneezeEffect / 2,
            z: 1,
            ease: 'power4.out',
        })

        gsap.to(this.dragon.components.eyeL.scale, {
            duration: speed,
            y: sneezeEffect / 2,
            ease: 'back.out',
        })
        gsap.to(this.dragon.components.eyeR.scale, {
            duration: speed,
            y: sneezeEffect / 2,
            ease: 'back.out',
        })

        gsap.to(this.dragon.components.wingL.rotation, {
            duration: speed,
            z: - Math.PI / 4 + rate * 0.15,
            ease: 'back.out',
        })
        gsap.to(this.dragon.components.wingR.rotation, {
            duration: speed,
            z: Math.PI / 4 - rate * 0.15,
            ease: 'back.out',
        })

        gsap.to(this.dragon.components.body.rotation, {
            duration: speed,
            x: rate * 0.02,
            ease: 'back.out',
        })
        gsap.to(this.dragon.components.body.scale, {
            duration: speed,
            y: 1 - rate * 0.03,
            ease: 'back.out',
        })
        gsap.to(this.dragon.components.body.position, {
            duration: speed,
            z: rate * 2,
            ease: 'back.out',
        })

        gsap.to(this.dragon.components.irisL.position, {
            duration: speed * 7,
            y: 35,
            ease: 'back.out',
        })
        gsap.to(this.dragon.components.irisR.position, {
            duration: speed * 7,
            y: 35,
            ease: 'back.out',
        })

        gsap.to(this.dragon.components.earR.rotation, {
            duration: speed * 3,
            x: rate * 0.2,
            y: rate * 0.2,
            ease: 'back.out',
        })
        gsap.to(this.dragon.components.earL.rotation, {
            duration: speed * 3,
            x: rate * 0.2,
            y: - rate * 0.2,
            ease: 'back.out',
            onComplete: () => {
                this.dragonBackToNormal(rate);
                this.fireRate = rate;
                console.log('fireRate', this.fireRate);
            }
        })

        gsap.to(this.dragon.components.tail.rotation, {
            duration: speed * 3,
            x: - rate * 0.1,
            ease: 'back.out',
        })
    }

    dragonBackToNormal(rate: number = 0) {
        const speed = 1 * this.globalSpeed;

        gsap.to(this.dragon.components.head.rotation, {
            duration: speed,
            x: 0,
            ease: 'power4.inOut'
        })
        gsap.to(this.dragon.components.head.position, {
            duration: speed,
            z: 30,
            y: 0,
            ease: 'back.out',
        })

        gsap.to(this.dragon.components.noseL.scale, {
            duration: speed,
            x: 1,
            y: 1,
            ease: 'power4.inOut'
        })
        gsap.to(this.dragon.components.noseR.scale, {
            duration: speed,
            x: 1,
            y: 1,
            ease: 'power4.inOut'
        })
        gsap.to(this.dragon.components.noseL.position, {
            duration: speed,
            y: 40,
            ease: 'power4.inOut'
        })
        gsap.to(this.dragon.components.noseR.position, {
            duration: speed,
            y: 40,
            ease: 'power4.inOut'
        })

        gsap.to(this.dragon.components.irisL.scale, {
            duration: speed,
            y: 1,
            z: 1,
            ease: 'back.out',
        })
        gsap.to(this.dragon.components.irisR.scale, {
            duration: speed,
            y: 1,
            z: 1,
            ease: 'back.out',
        })
        gsap.to(this.dragon.components.irisL.position, {
            duration: speed * 0.7,
            y: 30,
            ease: 'back.out',
        })
        gsap.to(this.dragon.components.irisR.position, {
            duration: speed * 0.7,
            y: 30,
            ease: 'back.out',
        })

        gsap.to(this.dragon.components.eyeL.scale, {
            duration: speed,
            y: 1,
            ease: 'power4.out',
        })
        gsap.to(this.dragon.components.eyeR.scale, {
            duration: speed,
            y: 1,
            ease: 'power4.out',
        })

        gsap.to(this.dragon.components.body.rotation, {
            duration: speed,
            x: 0,
            ease: 'back.out',
        })
        gsap.to(this.dragon.components.body.scale, {
            duration: speed,
            y: 1,
            ease: 'back.out',
        })
        gsap.to(this.dragon.components.body.position, {
            duration: speed,
            z: 0,
            ease: 'back.out',
        })

        gsap.to(this.dragon.components.wingL.rotation, {
            duration: speed,
            z: - Math.PI / 4,
            ease: 'back.inOut',
        })
        gsap.to(this.dragon.components.wingR.rotation, {
            duration: speed,
            z: Math.PI / 4,
            ease: 'back.inOut',
        })

        gsap.to(this.dragon.components.earL.rotation, {
            duration: speed * 1.3,
            x: 0,
            y: 0,
            ease: 'back.inOut',
        })
        gsap.to(this.dragon.components.earR.rotation, {
            duration: speed * 1.3,
            x: 0,
            y: 0,
            ease: 'back.inOut',
            onComplete: () => {
                this.isSneezing = false;
                this.timeSmoke = Math.round(rate * 5);
                console.log('timeSmoke', this.timeSmoke)
            }
        })

        gsap.to(this.dragon.components.tail.rotation, {
            duration: speed * 1.3,
            x: 0,
            ease: 'back.out',
        })

    }

    getSmokeParticle(): SmokeParticle {
        if(this.awaitingSmokeParticles.length === 0) {
            this.awaitingSmokeParticles.push(new SmokeParticle((smokeParticle) => {
                this.awaitingSmokeParticles.push(smokeParticle);
            }))
        }
        return this.awaitingSmokeParticles.pop() as SmokeParticle;
    }
}

const example = new Example(sel, debug);
example.init();