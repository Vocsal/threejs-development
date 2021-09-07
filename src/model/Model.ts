import * as THREE from "three";

export default class Model extends THREE.Group {

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
        const boxGeometry = new THREE.BoxGeometry(width, height, depth);
        const cube = new THREE.Mesh(boxGeometry, material);
        cube.position.set(positionX, positionY, positionZ);
        cube.rotation.set(rotationX, rotationY, rotationZ);
        return cube;
    }
}