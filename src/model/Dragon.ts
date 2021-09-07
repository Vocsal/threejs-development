import * as THREE from "three";
import Model from "./Model";

interface DragonParameters {
    castShadow?: boolean;
    wingAmplitude?: number;
    wingCircle?: number;
    tailAmplitude?: number;
    tailCircle?: number;
}

export default class Dragon extends Model {
    color!: Record<string, number>;
    material!: Record<string, THREE.Material>;
    components!: Record<string, THREE.Object3D>;

    wingAngle: number = 0;
    wingAmplitude: number = 0;
    wingCircle: number = 0;

    tailAngle: number = 0;
    tailAmplitude: number = 0;
    tailCircle: number = 0;

    constructor({
        castShadow = false,
        wingAmplitude = 0,
        wingCircle = 0,
        tailAmplitude = 0,
        tailCircle = 0,
    }: DragonParameters = {}) {
        super();
        this.wingAmplitude = wingAmplitude;
        this.wingCircle = wingCircle;
        this.tailAmplitude = tailAmplitude;
        this.tailCircle = tailCircle;

        this.createColorAndMaterial();
        this.add(this.createBody());
        this.add(this.createHead());
        this.add(this.createLegs());
        castShadow && this.traverse((obj: any) => {
            if (obj instanceof THREE.Mesh) {
                obj.castShadow = true;
                obj.receiveShadow = true;
            }
        })
    }

    createColorAndMaterial() {
        const color = {
            green: 0x5da683,
            lightGreen: 0x95c088,
            yellow: 0xfdde8c,
            red: 0xcb3e4c,
            black: 0x403133,
            white: 0xfaf3d7,
            brown: 0x874a5c,
            pink: 0xd0838e,
        }
        const material = {
            green: new THREE.MeshLambertMaterial({
                color: color.green,
                // shading: THREE.FlatShading,
            }),
            lightGreen: new THREE.MeshLambertMaterial({
                color: color.lightGreen,
            }),
            yellow: new THREE.MeshLambertMaterial({
                color: color.yellow,
            }),
            red: new THREE.MeshLambertMaterial({
                color: color.red,
            }),
            black: new THREE.MeshLambertMaterial({
                color: color.black,
            }),
            white: new THREE.MeshLambertMaterial({
                color: color.white,
            }),
            brown: new THREE.MeshLambertMaterial({
                color: color.brown,
            }),
            pink: new THREE.MeshLambertMaterial({
                color: color.pink,
            }),
        }

        this.color = color;
        this.material = material;
    }

    createBody(): THREE.Group {
        const body = new THREE.Group();
        // belly
        const belly = this.createCube(this.material.green, 30, 30, 40, 0, 0, 0, 0, 0, Math.PI / 4);
        body.add(belly);
        // wing
        const wingL = this.createCube(this.material.yellow, 5, 30, 20, 15, 15, 0, - Math.PI / 4, 0, - Math.PI / 4)
        wingL.geometry.applyMatrix4( new THREE.Matrix4().makeTranslation(0, 15, 10) );
        const wingR = wingL.clone();
        wingR.position.x = - wingL.position.x;
        wingR.rotation.z = - wingL.rotation.z;
        body.add(wingL);
        body.add(wingR);
        // pikes
        const pike1 = new THREE.Mesh(
            new THREE.CylinderGeometry(0, 10, 10, 4, 1),
            this.material.green
        )
        pike1.scale.set(0.2, 1, 1);
        pike1.position.z = 10;
        pike1.position.y = 26;
        body.add(pike1)
        const pike2 = pike1.clone();
        pike2.position.z = 0;
        body.add(pike2);
        const pike3 = pike1.clone();
        pike3.position.z = -10;
        body.add(pike3);
        // tail
        const tail = new THREE.Group();
        tail.position.z = -20;
        tail.position.y = 10;
        const tailMaterial = new THREE.LineBasicMaterial({
            color: this.color.green,
            linewidth: 5
        });
        const tailGeometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(0, 5, -10),
            new THREE.Vector3(0, -5, -20),
            new THREE.Vector3(0, 0, -30),
        ]);
        const tailLine = new THREE.Line(tailGeometry, tailMaterial);
        tail.add(tailLine);

        const pikeGeometry = new THREE.CylinderGeometry(0, 10, 10, 4, 1);
        pikeGeometry.applyMatrix4( new THREE.Matrix4().makeRotationX( - Math.PI / 2 ) );
        const tailPike = new THREE.Mesh(pikeGeometry, this.material.yellow);
        tailPike.scale.set(0.2, 1, 1);
        tailPike.position.z = -35;
        tailPike.position.y = 0;
        tail.add(tailPike);
        body.add(tail);

        const components = { body, belly, wingL, wingR, pike1, pike2, pike3, tail, tailLine, tailPike };
        this.components = Object.assign({}, this.components, components);

        return body;
    }

    createHead(): THREE.Group {
        const head = new THREE.Group();
        head.position.z = 30;
        // face
        const face = this.createCube(this.material.green, 60, 50, 80, 0, 25, 40, 0, 0, 0);
        head.add(face);
        // horn
        const hornGeometry = new THREE.CylinderGeometry(0, 6, 10, 4, 1);
        const hornL = new THREE.Mesh(hornGeometry, this.material.yellow)
        hornL.position.set(10, 55, 10);
        const hornR = hornL.clone();
        hornR.position.x = - hornL.position.x;
        head.add(hornL);
        head.add(hornR);
        // ear
        const earL = this.createCube(this.material.green, 5, 10, 20, 32, 42, 2, 0, 0, 0);
        earL.geometry.applyMatrix4( new THREE.Matrix4().makeTranslation(0, 5, -10) );
        earL.geometry.applyMatrix4( new THREE.Matrix4().makeRotationX(Math.PI / 4) );
        earL.geometry.applyMatrix4( new THREE.Matrix4().makeRotationY( - Math.PI / 4 ) );
        const earR = this.createCube(this.material.green, 5, 10, 20, -32, 42, 2, 0, 0, 0);
        earR.geometry.applyMatrix4( new THREE.Matrix4().makeTranslation(0, 5, -10) );
        earR.geometry.applyMatrix4( new THREE.Matrix4().makeRotationX(Math.PI / 4) );
        earR.geometry.applyMatrix4( new THREE.Matrix4().makeRotationY(Math.PI / 4 ) );
        head.add(earL);
        head.add(earR);
        // mouth
        const mouth = new THREE.Group();
        mouth.position.z = 50;
        mouth.position.y = 3;
        mouth.rotation.x = 0;
        // mouth jaw
        const jaw = this.createCube(this.material.green, 30, 10, 30, 0, -5, 15, 0, 0, 0);
        mouth.add(jaw);
        // mouth tongue
        const tongue = this.createCube(this.material.red, 20, 10, 20, 0, -3, 15, 0, 0, 0);
        mouth.add(tongue);
        head.add(mouth);
        // smile
        const smileGeometry = new THREE.TorusGeometry(6, 2, 2, 10, Math.PI);
        const smile = new THREE.Mesh(smileGeometry, this.material.black)
        smile.position.z = 82;
        smile.position.y = 5;
        smile.rotation.z = - Math.PI;
        head.add(smile);
        // cheek
        const cheekL = this.createCube(this.material.lightGreen, 4, 20, 20, 30, 18, 55, 0, 0, 0);
        const cheekR = cheekL.clone();
        cheekR.position.x = - cheekL.position.x;
        head.add(cheekL);
        head.add(cheekR);
        // spots
        const spot1 = this.createCube(this.material.lightGreen, 2, 2, 2, 20, 16, 80, 0, 0, 0);
        const spot2 = spot1.clone();
        spot2.position.x = 15;
        spot2.position.y = 14;
        const spot3 = spot1.clone();
        spot3.position.x = 16;
        spot3.position.y = 20;
        const spot4 = spot1.clone();
        spot4.position.x = 12;
        spot4.position.y = 18;
        const spot5 = spot1.clone();
        spot5.position.x = -15
        spot5.position.y = 14;
        const spot6 = spot1.clone();
        spot6.position.x = -14;
        spot6.position.y = 20;
        const spot7 = spot1.clone();
        spot7.position.x = -19;
        spot7.position.y = 17;
        const spot8 = spot1.clone();
        spot8.position.x = -11;
        spot8.position.y = 17;
        head.add(spot1);
        head.add(spot2);
        head.add(spot3);
        head.add(spot4);
        head.add(spot5);
        head.add(spot6);
        head.add(spot7);
        head.add(spot8);
        // eye
        const eyeL = this.createCube(this.material.white, 10, 22, 22, 27, 34, 18, 0, 0, 0);
        const eyeR = eyeL.clone();
        eyeR.position.x = - eyeL.position.x;
        head.add(eyeL);
        head.add(eyeR);
        // iris
        const irisL = this.createCube(this.material.brown, 10, 12, 12, 28, 30, 24, 0, 0, 0);
        const irisR = irisL.clone();
        irisR.position.x = - irisL.position.x;
        head.add(irisL);
        head.add(irisR);
        // nose
        const noseL = this.createCube(this.material.black, 5, 5, 8, 5, 40, 77, 0, 0, 0);
        const noseR = noseL.clone();
        noseR.position.x = - noseL.position.x;
        head.add(noseL);
        head.add(noseR);

        const components = { head, face, hornL, hornR, earL, earR, mouth, jaw, tongue, smile, cheekL, cheekR, spot1, spot2, spot3, spot4, spot5, spot6, spot7, spot8, eyeL, eyeR, irisL, irisR, noseL, noseR };
        this.components = Object.assign({}, this.components, components);

        return head;
    }

    createLegs(): THREE.Group {
        const leg = new THREE.Group();
        const legFL = this.createCube(this.material.green, 20, 10, 20, 20, -30, 15, 0, 0, 0);
        const legFR = legFL.clone();
        legFR.position.x = -30;
        const legBL = legFL.clone();
        legBL.position.z = -15;
        const legBR = legBL.clone();
        legBR.position.x = - 30;
        leg.add(legFL);
        leg.add(legFR);
        leg.add(legBL);
        leg.add(legBR);

        const components = { leg, legFL, legFR, legBL, legBR };
        this.components = Object.assign({}, this.components, components);

        return leg;
    }

    /**
     * @param timeInterval 时间间隔，秒
     */
    runWings(timeInterval: number = 0): void {
        const amplitude = this.wingAmplitude;
        const circle = this.wingCircle;
        if(timeInterval === 0 || amplitude === 0 || circle === 0) return;
        this.wingAngle += Math.PI * timeInterval / circle;
        this.components.wingL.rotation.z = Math.cos(this.wingAngle) * amplitude - Math.PI / 4;
        this.components.wingR.rotation.z = - Math.cos(this.wingAngle) * amplitude + Math.PI / 4;
    }

    /**
     * @param timeInterval 时间间隔，秒
     */
    runTail(timeInterval: number = 0): void {
        const amplitude = this.tailAmplitude;
        const circle = this.tailCircle;
        if(timeInterval === 0 || amplitude === 0 || circle === 0) return;
        this.tailAngle += Math.PI * timeInterval / circle;
        const tailLineGeometry = (this.components.tailLine as THREE.Mesh).geometry;
        const tailLineAttribute = tailLineGeometry.getAttribute('position');
        for( let i = 0; i < tailLineAttribute.count; i++ ) {
            const x = Math.cos( this.tailAngle / 2 + ( Math.PI / 4 ) * i ) * amplitude * i * i;
            const y = Math.sin( this.tailAngle - ( Math.PI / 3 ) * i ) * amplitude * i * i;
            tailLineAttribute.setX(i, x);
            tailLineAttribute.setY(i, y);
            if(i === tailLineAttribute.count - 1) {
                this.components.tailPike.position.x = x;
                this.components.tailPike.position.y = y;
                this.components.tailPike.rotation.x = y / 30;
            }
        }
        tailLineAttribute.needsUpdate = true;
    }

    run(timeInterval: number) {
        this.runWings(timeInterval);
        this.runTail(timeInterval);
    }
}