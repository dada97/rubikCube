import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/Addons.js";

interface Cell {
  id: number;
  object: THREE.Object3D;
}

export default class RubikCube extends THREE.Object3D {
  public cubeList: THREE.Object3D[] = [];

  private initialPos: THREE.Vector3[] = [];
  private cellInfo: Cell[] = [];

  //cell_info

  constructor() {
    super();
    this.generateCube();
  }

  generateCube() {
    for (let y = 0; y < 3; y++) {
      for (let z = 0; z < 3; z++) {
        for (let x = 0; x < 3; x++) {
          let geometry = new RoundedBoxGeometry();
          let material = new THREE.MeshPhysicalMaterial({
            color: "#000000",
            metalness: 0.5,
            roughness: 0.1,
            clearcoat: 0.1,
            reflectivity: 0.5,
          });
          let cube = new THREE.Mesh(geometry, material);

          let geo = this.roundedPlaneGeometry(0.8, 0.12, 0.01);
          let mat = new THREE.MeshPhysicalMaterial({
            color: new THREE.Color(0xffffff),
            metalness: 0.0,
            roughness: 0.25,
            ior: 1.5,
            clearcoat: 0.0,
            reflectivity: 0.5,
            specularIntensity: 0.22,
            side: THREE.DoubleSide,
          });

          if (y == 0) {
            const planeT = new THREE.Mesh(geo, mat);
            planeT.position.set(0, 0.5001, 0);
            planeT.rotateX(-Math.PI / 2);
            cube.add(planeT);
          }

          if (y == 2) {
            let matD = mat.clone();
            matD.color = new THREE.Color(0xf9ec66);
            const planeD = new THREE.Mesh(geo, matD);
            planeD.position.set(0, -0.5001, 0);
            planeD.rotateX(Math.PI / 2);
            cube.add(planeD);
          }

          if (z == 2) {
            let matF = mat.clone();
            matF.color = new THREE.Color(0x81b148);
            const planeF = new THREE.Mesh(geo, matF);
            planeF.position.set(0, 0, 0.5001);
            cube.add(planeF);
          }

          if (z == 0) {
            let matB = mat.clone();
            matB.color = new THREE.Color(0x5ea6c3);
            const planeB = new THREE.Mesh(geo, matB);
            planeB.position.set(0, 0, -0.5001);
            cube.add(planeB);
          }

          if (x == 0) {
            let matL = mat.clone();
            matL.color = new THREE.Color(0xed9036);
            const planeL = new THREE.Mesh(geo, matL);
            planeL.position.set(-0.5001, 0, 0);
            planeL.rotateY(Math.PI / 2);
            cube.add(planeL);
          }

          if (x == 2) {
            let matR = mat.clone();
            matR.color = new THREE.Color(0xd94932);
            const planeR = new THREE.Mesh(geo, matR);
            planeR.position.set(0.5001, 0, 0);
            planeR.rotateY(Math.PI / 2);
            cube.add(planeR);
          }

          cube.position.set(x - 1, 1 - y, z - 1);
          this.initialPos.push(cube.position.clone());

          this.add(cube);

          this.cubeList.push(cube);

          this.cellInfo.push({
            id: y * 9 + x * 3 + z,
            object: cube,
          });
        }
      }
    }
  }

  private roundedPlaneGeometry(size: number, radius: number, depth: number) {
    var x, y, width, height;

    x = y = -size / 2;
    width = height = size;
    radius = size * radius;

    const shape = new THREE.Shape();

    shape.moveTo(x, y + radius);
    shape.lineTo(x, y + height - radius);
    shape.quadraticCurveTo(x, y + height, x + radius, y + height);
    shape.lineTo(x + width - radius, y + height);
    shape.quadraticCurveTo(
      x + width,
      y + height,
      x + width,
      y + height - radius
    );
    shape.lineTo(x + width, y + radius);
    shape.quadraticCurveTo(x + width, y, x + width - radius, y);
    shape.lineTo(x + radius, y);
    shape.quadraticCurveTo(x, y, x, y + radius);

    const geometry = new THREE.ExtrudeGeometry(shape, {
      depth: depth,
      bevelEnabled: false,
      curveSegments: 3,
    });

    return geometry;
  }

  public checkWin() {
    let succes = true;
    this.cubeList.forEach((cube, index) => {
      if (cube.position.distanceTo(this.initialPos[index]) > 0.1) {
        succes = false;
      }
    });

    return succes;
  }
}
