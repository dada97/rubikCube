import * as THREE from "three";

import RubikCube from "./RubikCube";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import gsap from "gsap";

export default class ThreeScene {
  //   scene: THREE.Scene;
  public element: HTMLElement | null;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private width: number = 1920;
  private height: number = 1080;

  private cube: RubikCube;

  private startSelectedCube: THREE.Intersection | undefined = undefined;
  private scene: THREE.Scene;

  private rotatingCubes = new THREE.Group();
  private orbitControl: OrbitControls;

  private enableDrag = true;
  private enableStart = false;

  //initialize three Scene
  constructor() {
    // ------------------------------------------------
    // BASIC SETUP
    // ------------------------------------------------

    // Create an empty scene
    this.scene = new THREE.Scene();

    // Create a basic perspective camera
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.x = -4;
    this.camera.position.y = 4;
    this.camera.position.z = 4;

    // Create a renderer with Antialiasing
    this.renderer = new THREE.WebGLRenderer({ antialias: true });

    // Configure renderer clear color
    this.renderer.setClearColor("#000000");

    // Configure renderer size
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    // Append Renderer to DOM

    this.element = document.getElementById("threeCanvas");
    this.element?.appendChild(this.renderer.domElement);

    this.orbitControl = new OrbitControls(
      this.camera,
      this.renderer.domElement
    );

    window.addEventListener("resize", this.windowResizedHandler, false);

    // ------------------------------------------------
    // FUN STARTS HERE
    // ------------------------------------------------

    // Create a Cube Mesh with basic material

    const LIGHT_COLOR = 0xffffff;
    const LIGHT_INTENSITY = 4;
    const LIGHT_DISTANCE = 4;

    const light1 = new THREE.DirectionalLight(LIGHT_COLOR, LIGHT_INTENSITY);
    light1.position.set(0, 0, LIGHT_DISTANCE);
    this.scene.add(light1);

    const light2 = new THREE.DirectionalLight(LIGHT_COLOR, LIGHT_INTENSITY);
    light2.position.set(0, 0, -LIGHT_DISTANCE);
    this.scene.add(light2);

    const light3 = new THREE.DirectionalLight(LIGHT_COLOR, LIGHT_INTENSITY);
    light3.position.set(0, LIGHT_DISTANCE, 0);
    this.scene.add(light3);

    const light4 = new THREE.DirectionalLight(LIGHT_COLOR, LIGHT_INTENSITY);
    light4.position.set(0, -LIGHT_DISTANCE, 0);
    this.scene.add(light4);

    const light5 = new THREE.DirectionalLight(LIGHT_COLOR, LIGHT_INTENSITY);
    light5.position.set(LIGHT_DISTANCE, 0, 0);
    this.scene.add(light5);

    const light6 = new THREE.DirectionalLight(LIGHT_COLOR, LIGHT_INTENSITY);
    light6.position.set(-LIGHT_DISTANCE, 0, 0);
    this.scene.add(light6);

    this.cube = new RubikCube();

    // Add cube to Scene
    this.scene.add(this.cube);

    document.addEventListener("pointerdown", this.onPointerDown);
    document.addEventListener("pointermove", this.pointerMove);
    document.addEventListener("pointerup", this.onPointerUp);

    this.render();

    var tl = gsap.timeline({ repeat: -1 });

    tl.to(this.cube.position, { y: 0.3, ease: "sine.inOut", duration: 2.0 });
    tl.to(this.cube.position, { y: 0.0, ease: "sine.inOut", duration: 2.0 });
    tl.play();
  }

  public async startGame() {
    this.enableStart = false;
    await this.randomCube();
    this.enableStart = true;
  }

  async randomCube() {
    const count = 1;
    const dirlist = ["x", "y", "z", "-x", "-y", "-z"];

    let dir = "x";
    const angle = this.cube.rotation.y - Math.PI * 4;
    gsap.to(this.cube.rotation, {
      duration: 5.5,
      y: angle,
      ease: "sine.inOut",
    });
    for (let i = 0; i < count; i++) {
      dir = dirlist[Math.floor(Math.random() * 6)];
      const cube =
        this.cube.cubeList[
          Math.floor(Math.random() * this.cube.cubeList.length)
        ];

      this.findGroup(dir, cube);
      await this.animateGroup(dir, 0.25);
    }
  }

  render = () => {
    requestAnimationFrame(this.render);
    this.orbitControl.update();
    // Render the scene
    this.renderer.render(this.scene, this.camera);
  };

  private windowResizedHandler = () => {
    const rect = this.element?.getBoundingClientRect();
    if (rect != undefined) {
      this.width = rect.width;
      this.height = rect.height;
    }

    if (this.camera instanceof THREE.PerspectiveCamera)
      this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.width, this.height);
  };

  onPointerDown = (e: PointerEvent) => {
    if (this.enableDrag == false || this.enableStart == false) return;

    const pointer = new THREE.Vector2();
    pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(pointer, this.camera);

    let intersects = raycaster.intersectObjects(this.cube.cubeList, false);

    if (intersects[0] !== undefined) {
      // controls.enableRotate = false;
      this.startSelectedCube = intersects[0];
      this.orbitControl.enabled = false;
    }
  };

  pointerMove = async (e: PointerEvent) => {
    if (this.enableDrag == false || this.enableStart == false) return;
    if (this.startSelectedCube === undefined) return;

    const pointer = new THREE.Vector2();
    pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(pointer, this.camera);
    let intersects = raycaster.intersectObjects(this.cube.cubeList, false);

    let dx = this.startSelectedCube.point.x - intersects[0].point.x;
    let dy = this.startSelectedCube.point.y - intersects[0].point.y;
    let dz = this.startSelectedCube.point.z - intersects[0].point.z;

    let absX = Math.abs(dx);
    let absY = Math.abs(dy);
    let absZ = Math.abs(dz);

    let limit = 0.3;

    const rotationDirection = this.recognizeDirection(
      dx,
      dy,
      dz,
      absX,
      absY,
      absZ,
      limit
    );

    if (
      rotationDirection !== "" &&
      rotationDirection != undefined &&
      this.startSelectedCube !== undefined
    ) {
      this.findGroup(rotationDirection);
      this.startSelectedCube = undefined;

      await this.animateGroup(rotationDirection);
      if (this.cube.checkWin()) {
        alert("Win!");
      }
    }
  };

  private recognizeDirection(
    dx: number,
    dy: number,
    dz: number,
    absX: number,
    absY: number,
    absZ: number,
    limit: number
  ) {
    let rotationDirection: string = "";
    if (this.startSelectedCube == undefined) return;

    if (this.startSelectedCube.point.x > 1.4) {
      if (absY > limit || absZ > limit) {
        if (absY > absZ) {
          rotationDirection = dy < 0 ? "z" : "-z";
        } else {
          rotationDirection = dz < 0 ? "-y" : "y";
        }
      }
    } else if (this.startSelectedCube.point.y > 1.4) {
      if (absX > limit || absZ > limit) {
        if (absX > absZ) {
          rotationDirection = dx < 0 ? "-z" : "z";
        } else {
          rotationDirection = dz < 0 ? "x" : "-x";
        }
      }
    } else if (this.startSelectedCube.point.z > 1.4) {
      if (absX > limit || absY > limit) {
        if (absX > absY) {
          rotationDirection = dx < 0 ? "y" : "-y";
        } else {
          rotationDirection = dy < 0 ? "-x" : "x";
        }
      }
    } else if (this.startSelectedCube.point.x < -1.4) {
      if (absY > limit || absZ > limit) {
        if (absY > absZ) {
          rotationDirection = dy < 0 ? "-z" : "z";
        } else {
          rotationDirection = dz < 0 ? "y" : "-y";
        }
      }
    } else if (this.startSelectedCube.point.y < -1.4) {
      if (absX > limit || absZ > limit) {
        if (absX > absZ) {
          rotationDirection = dx < 0 ? "z" : "-z";
        } else {
          rotationDirection = dz < 0 ? "-x" : "x";
        }
      }
    } else if (this.startSelectedCube.point.z < -1.4) {
      if (absX > limit || absY > limit) {
        if (absX > absY) {
          rotationDirection = dx < 0 ? "-y" : "y";
        } else {
          rotationDirection = dy < 0 ? "x" : "-x";
        }
      }
    }
    return rotationDirection;
  }

  private findGroup(rotationDirection: string, startObj?: THREE.Object3D) {
    const startcube = this.startSelectedCube?.object || startObj;
    if (startcube == undefined) return;

    let group;
    if (rotationDirection === "y" || rotationDirection === "-y") {
      group = this.cube.cubeList.filter(
        (x) => Math.abs(x.position.y - startcube.position.y) < 0.05
      );
    } else if (rotationDirection === "x" || rotationDirection === "-x") {
      group = this.cube.cubeList.filter(
        (x) => Math.abs(x.position.x - startcube.position.x) < 0.05
      );
    } else if (rotationDirection === "z" || rotationDirection === "-z") {
      group = this.cube.cubeList.filter(
        (x) => Math.abs(x.position.z - startcube.position.z) < 0.05
      );
    }
    this.rotatingCubes = new THREE.Group();
    group?.forEach((x) => this.rotatingCubes.add(x));
    this.cube.add(this.rotatingCubes);
  }

  animateGroup = async (rotationDirection: string, duration = 0.5) => {
    this.enableDrag = false;
    let d = 0;
    let rotateAboutAxis: any;
    let rotateAbsolute: any;

    if (rotationDirection === "x") {
      rotateAboutAxis = (d: number) =>
        (this.rotatingCubes.rotation.x = THREE.MathUtils.degToRad(d));
      rotateAbsolute = () => (this.rotatingCubes.rotation.x = Math.PI / 2);
    } else if (rotationDirection === "-x") {
      rotateAboutAxis = (d: number) =>
        (this.rotatingCubes.rotation.x = THREE.MathUtils.degToRad(-d));
      rotateAbsolute = () => (this.rotatingCubes.rotation.x = -Math.PI / 2);
    } else if (rotationDirection === "y") {
      rotateAboutAxis = (d: number) =>
        (this.rotatingCubes.rotation.y = THREE.MathUtils.degToRad(d));
      rotateAbsolute = () => (this.rotatingCubes.rotation.y = Math.PI / 2);
    } else if (rotationDirection === "-y") {
      rotateAboutAxis = (d: number) =>
        (this.rotatingCubes.rotation.y = THREE.MathUtils.degToRad(-d));
      rotateAbsolute = () => (this.rotatingCubes.rotation.y = -Math.PI / 2);
    } else if (rotationDirection === "z") {
      rotateAboutAxis = (d: number) =>
        (this.rotatingCubes.rotation.z = THREE.MathUtils.degToRad(d));
      rotateAbsolute = () => (this.rotatingCubes.rotation.z = Math.PI / 2);
    } else if (rotationDirection === "-z") {
      rotateAboutAxis = (d: number) =>
        (this.rotatingCubes.rotation.z = THREE.MathUtils.degToRad(-d));
      rotateAbsolute = () => (this.rotatingCubes.rotation.z = -Math.PI / 2);
    }
    const target = {
      d: 0,
    };

    await gsap.to(target, {
      d: 90,
      duration: duration,
      ease: "power3.inOut",
      onUpdate: () => {
        rotateAboutAxis(target.d);
      },
      onComplete: () => {
        rotateAbsolute();

        if (this.rotatingCubes !== undefined) {
          this.enableDrag = true;
          this.ungroup();
        }
      },
    });
  };

  private ungroup() {
    const children = this.rotatingCubes.children;

    // this.cube.remove(this.rotatingCubes);

    for (let i = children.length - 1; i >= 0; i--) {
      this.cube.attach(children[i]);
      // children[i].removeFromParent();
    }

    this.cube.remove(this.rotatingCubes);
  }

  onPointerUp = () => {
    this.startSelectedCube = undefined;
    this.orbitControl.enabled = true;
  };
}
