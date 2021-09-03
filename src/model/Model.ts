import * as THREE from "three";

export default class Model {
    Object3D!: THREE.Object3D;
    oldScale: number = 1;
    scale: number = 1;

    setScale(scale: number): void {
        this.oldScale = this.scale;
        this.scale = scale;
        this.updateApplyProperty();
    };

    updateApplyProperty(): void {
        // 模型属性改变后，进行适应
    }

    createCube(
        material: THREE.Material,
        width: number,
        height: number,
        depth: number,
        positionX: number,
        positionY: number,
        positionZ: number,
        rotationX: number,
        rotationY: number,
        rotationZ: number,
    ) {
        const scale = this.scale;
        const boxGeometry = new THREE.BoxGeometry(width * scale, height * scale, depth * scale);
        const cube = new THREE.Mesh(boxGeometry, material);
        cube.position.set(positionX, positionY, positionZ);
        cube.rotation.set(rotationX, rotationY, rotationZ);
        return cube;
    }
}