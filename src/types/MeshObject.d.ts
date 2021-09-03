import * as THREE from "three";

export default interface MeshObject {
    geometry?: THREE.BufferGeometry;
    material?: THREE.Material;
    position?: THREE.Vector3;
}