import * as THREE from "three";
import Model from "./Model";

export default class Dragon extends Model {
    material!: Record<string, THREE.Material>;

    constructor() {
        super();
        this.Object3D = new THREE.Group();
        this.createMaterial();
    }

    createMaterial() {
        this.material.green = new THREE.MeshLambertMaterial({
            color: 0x5da683,
            // shading: THREE.FlatShading,
        })
    }

    createBody() {

    }

    createBelly() {
        const belly = this.createCube(this.material.green, 30, 30, 40, 0, 0, 0, 0, 0, Math.PI / 4);
        this.Object3D.add(belly);
    }

    createHead() {

    }
}