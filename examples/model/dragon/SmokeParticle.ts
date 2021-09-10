import * as THREE from "three";
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import gsap from "gsap";
gsap.registerPlugin(MotionPathPlugin);

interface Color {
    r: number;
    g: number;
    b: number;
}

interface InitCallback {
    (smokeParticle: SmokeParticle): void;
}

export default class SmokeParticle {
    color: Color = { r: 0, g: 0, b: 0 };
    mesh: THREE.Mesh;

    initCallback: InitCallback;

    globalSpeed: number = 1;
    maxSneezingRate: number = 8;

    constructor(initCallback: InitCallback) {
        this.initCallback = initCallback;
        this.color = { r: 0, g: 0, b: 0 };
        this.mesh = new THREE.Mesh(
            new THREE.BoxGeometry(4, 4, 4),
            new THREE.MeshLambertMaterial({
                transparent: true,
                opacity: 0.5,
            })
        );
        this.initialize();
    }

    initialize(): void {
        this.mesh.rotation.set(0, 0, 0);
        this.mesh.position.set(0, 0, 0);
        this.mesh.scale.set(1, 1, 1);
        (this.mesh.material as THREE.Material).opacity = 0.5;
        this.initCallback(this);
    }

    updateColor(): void {
        (this.mesh.material as THREE.MeshLambertMaterial).color.setRGB(this.color.r, this.color.g, this.color.b);
    }

    fly(): void {
        const speed = 10 * this.globalSpeed;
        const ease = 'power4.out';
        const initX = this.mesh.position.x;
        const initY = this.mesh.position.y;
        const initZ = this.mesh.position.z;

        const bezier = {
            type: "cubic",
            // values: 
            path: [
                {
                    x: initX,
                    y: initY,
                    z: initZ,
                },
                {
                    x: initX + 30 - Math.random() * 10,
                    y: initY + 20 + Math.random() * 2,
                    z: initZ + 20,
                },
                {
                    x: initX + 10 + Math.random() * 20,
                    y: initY + 40 + Math.random() * 5,
                    z: initZ - 30,
                },
                {
                    x: initX + 50 - Math.random() * 20,
                    y: initY + 70 + Math.random() * 10,
                    z: initZ + 20,
                }
            ]
        };

        gsap.to(this.mesh.position, {
            duration: speed,
            motionPath: bezier,
            ease,
        })
        gsap.to(this.mesh.rotation, {
            duration: speed,
            x: Math.random() * Math.PI * 3,
            y: Math.random() * Math.PI * 3,
            ease,
        })
        gsap.to(this.mesh.scale, {
            duration: speed,
            x: 5 + Math.random() * 5,
            y: 5 + Math.random() * 5,
            z: 5 + Math.random() * 5,
            ease,
        })

        gsap.to(this.mesh.material, {
            duration: speed,
            opacity: 0,
            ease,
            onComplete: () => {
                this.initialize();
            }
        })
    }

    fire(rate: number = 0): void {
        const speed = 1 * this.globalSpeed;
        const maxSneezingRate = this.maxSneezingRate;
        const ease = "power4.out";
        // const initX = this.mesh.position.x;
        const initY = this.mesh.position.y;
        const initZ = this.mesh.position.z;

        gsap.to(this.mesh.position, {
            duration: speed,
            x: 0,
            y: initY - 2 * rate,
            z: Math.max(initZ + 15 * rate, initZ + 40),
            ease,
        })
        gsap.to(this.mesh.rotation, {
            duration: speed,
            x: Math.random() * Math.PI * 3,
            z: Math.random() * Math.PI * 3,
            ease,
        })

        const bezierScale = [
            {
                x: 1,
                y: 1,
                z: 1,
            },
            {
                x: rate / maxSneezingRate + Math.random() * 0.3,
                y: rate / maxSneezingRate + Math.random() * 0.3,
                z: (rate * 2) / maxSneezingRate + Math.random() * 0.3,
            },
            {
                x: rate / maxSneezingRate + Math.random() * 0.5,
                y: rate / maxSneezingRate + Math.random() * 0.5,
                z: (rate * 2) / maxSneezingRate + Math.random() * 0.5,
            },
            {
                x: (rate * 2) / maxSneezingRate + Math.random() * 0.5,
                y: (rate * 2) / maxSneezingRate + Math.random() * 0.5,
                z: (rate * 4) / maxSneezingRate + Math.random() * 0.5,
            },
            {
                x: rate * 2 + Math.random() * 5,
                y: rate * 2 + Math.random() * 5,
                z: rate * 2 + Math.random() * 5,
            },
        ];

        gsap.to(this.mesh.scale, {
            duration: speed * 2,
            motionPath: bezierScale,
            ease,
            onComplete: () => {
                this.initialize();
            }
        })

        gsap.to(this.mesh.material, {
            duration: speed,
            opacity: 0,
            ease,
        })

        const bezierColor = [
            {
                r: 255 / 255,
                g: 255 / 255,
                b: 255 / 255,
            },
            {
                r: 255 / 255,
                g: 205 / 255,
                b: 74 / 255,
            },
            {
                r: 255 / 255,
                g: 205 / 255,
                b: 74 / 255,
            },
            {
                r: 247 / 255,
                g: 34 / 255,
                b: 50 / 255,
            },
            {
                r: 0 / 255,
                g: 0 / 255,
                b: 0 / 255,
            },
        ];

        gsap.to(this.color, {
            duration: speed,
            motionPath: bezierColor,
            ease,
            onUpdate: () => {
                this.updateColor();
            }
        })
    }
}