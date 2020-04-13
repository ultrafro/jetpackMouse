import * as THREE from "three";

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls";
import pointer from "./pointer";

import makeCity from "./makecity";
import makeCity2 from "./makeCity2";
import LookControls from "./LookControls";
import { Vector3 } from "three";
import ParticleSystem from "./ParticleSystem";
//import Partykals from "partykals";

class MouseGame {
  constructor({ scene, camera, renderer, element }) {
    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;
    this.element = element;
    this.controls = null;

    this.lastTime = performance.now();

    this.velocity = new Vector3();
    //this.gravityAcc = new Vector3(0, -9.8, 0);
    this.gravityAcc = new Vector3(0, -100, 0);
    this.gravityVel = new Vector3();
    this.boostVel = new Vector3();
    this.boostAcc = new Vector3(0, 10, 0);
    this.boost = false;

    this.buildingMap = null;
  }

  init() {
    let geometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
    let material = new THREE.MeshNormalMaterial();

    let mesh = new THREE.Mesh(geometry, material);
    let mesh2 = new THREE.Mesh(geometry, material);
    this.scene.add(this.camera);
    this.scene.add(mesh);
    this.scene.add(mesh2);
    this.camera.add(mesh);

    mesh.position.set(0, 0, -1);
    this.camera.position.set(0, 100, 0);

    //makeCity2({ scene, steps: 100 });

    var ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    this.scene.add(ambientLight);

    const { cityMesh, buildingMap } = makeCity(this.renderer);
    this.scene.add(cityMesh);

    this.buildingMap = buildingMap;

    this.system = new ParticleSystem({
      numParticles: 100,
      velocity: new Vector3(0, -10.0, 0),
      lifetime: 0.1,
      radius: 1,
      startColor: new THREE.Color(1, 0, 0),
      stopColor: new THREE.Color(1, 0, 0),
      src: "smoke.png",
    });

    this.scene.add(this.system.particleSystem);
    mesh.add(this.system.particleSystem);
    this.system.particleSystem.position.set(-0.5, -2, -4);

    // // create the particle variables
    // var particleCount = 1800;
    // var particles = new THREE.Geometry();
    // // var pMaterial = new THREE.ParticleBasicMaterial({
    // //     color: 0xffffff,
    // //     size: 20,
    // //   });

    // var pMaterial = new THREE.ParticleBasicMaterial({
    //   color: 0xffffff,
    //   size: 20,
    //   map: THREE.ImageUtils.loadTexture("smoke.png"),
    //   blending: THREE.AdditiveBlending,
    //   transparent: true,
    // });

    // // now create the individual particles
    // for (var p = 0; p < particleCount; p++) {
    //   // create a particle with random
    //   // position values, -250 -> 250
    //   let pX = Math.random() * 500 - 250,
    //     pY = Math.random() * 500 - 250,
    //     pZ = Math.random() * 500 - 250,
    //     v = new THREE.Vector3(pX, pY, pZ);
    //   let particle = new THREE.Vertex(pX, pY, pZ);
    //   //particle = new THREE.Vertex(new THREE.Vector3(pX, pY, pZ));

    //   //console.log(pX, pY, pZ);
    //   // add it to the geometry
    //   particles.vertices.push(particle);
    // }

    // // create the particle system
    // //this.particleSystem = new THREE.ParticleSystem(particles, pMaterial);
    // this.particleSystem = new THREE.Points(particles, pMaterial);
    // this.particleSystem.sortParticles = true;

    // // add it to the scene
    // this.scene.add(this.particleSystem);

    //this.controls = new OrbitControls(this.camera, this.element);
    //this.controls = new PointerLockControls(this.camera, this.element);
    //this.controls = new pointer(this.camera, this.element);
    // this.controls = new pointer(this.camera);
    //this.controls.unlock();
    this.controls = new LookControls(this.camera, this.element);
    this.setupKeys();
  }

  setupKeys() {
    document.addEventListener(
      "keydown",
      function (event) {
        if (event.code == "Space") {
          this.boost = true;
        }

        if (event.code == "KeyW") {
          this.up = true;
        }

        if (event.code == "KeyA") {
          this.left = true;
        }

        if (event.code == "KeyS") {
          this.down = true;
        }

        if (event.code == "KeyD") {
          this.right = true;
        }
      }.bind(this)
    );

    document.addEventListener(
      "keyup",
      function (event) {
        if (event.code == "Space") {
          this.boost = false;
        }

        if (event.code == "KeyW") {
          this.up = false;
        }

        if (event.code == "KeyA") {
          this.left = false;
        }

        if (event.code == "KeyS") {
          this.down = false;
        }

        if (event.code == "KeyD") {
          this.right = false;
        }
      }.bind(this)
    );
  }

  checkCollision({ position, buildingMap }) {
    let collision = false;
    for (let key in buildingMap) {
      let building = buildingMap[key];

      //check if position is in building:
      let xdist = Math.abs(position.x - building.x);
      let zdist = Math.abs(position.z - building.z);
      let ydist = position.y - building.scaleY;

      if (xdist < building.scaleX && zdist < building.scaleZ && ydist < 0.5) {
        collision = true;
        return true;
      }
    }

    return false;
  }

  update() {
    //console.log("loop");
    //console.log(this.camera.position.y);

    let now = performance.now();
    let elapsed = now - this.lastTime;
    this.lastTime = now;

    // let newX = this.controls.target.x + (this.velocity.x * elapsed) / 1000;
    // let newY = this.controls.target.y + (this.velocity.y * elapsed) / 1000;
    // let newZ = this.controls.target.z + (this.velocity.z * elapsed) / 1000;
    //this.controls.target.set(newX, newY, newZ);

    this.velocity = new Vector3();

    //this.velocity.add(new Vector3(0, -10, 0));

    if (this.boost) {
      //   let boostPart = new Vector3();
      //   boostPart.copy(this.boostAcc);
      //   boostPart.multiplyScalar(elapsed / 1000);
      //   this.boostVel.add(boostPart);
      //   this.velocity.add(this.boostVel);
      this.velocity.add(new Vector3(0, 50, 0));
      this.gravityVel = new Vector3();
    } else {
      let gravityPart = new Vector3();
      gravityPart.copy(this.gravityAcc);
      gravityPart.multiplyScalar(elapsed / 1000);
      this.gravityVel.add(gravityPart);

      this.velocity.add(this.gravityVel);
    }

    // console.log(
    //   "gravity y: " +
    //     this.gravityVel.y.toFixed(3) +
    //     " v: " +
    //     this.velocity.y.toFixed(3)
    // );

    let forward = new THREE.Vector3();
    this.camera.getWorldDirection(forward);
    //project forward onto XZ plane:
    let up = new Vector3(0, 1, 0);
    let perp = new Vector3();
    perp.copy(up);
    perp.multiplyScalar(forward.dot(up));
    forward.sub(perp);
    forward.normalize();
    let right = new Vector3();
    right.copy(forward);
    right.cross(up);

    let directionalFactor = 30;

    if (this.up) {
      let additional = new Vector3();
      additional.copy(forward);
      additional.multiplyScalar(directionalFactor);
      this.velocity.add(additional);
    }
    if (this.down) {
      let additional = new Vector3();
      additional.copy(forward);
      additional.multiplyScalar(directionalFactor);
      this.velocity.sub(additional);
    }
    if (this.left) {
      let additional = new Vector3();
      additional.copy(right);
      additional.multiplyScalar(directionalFactor);
      this.velocity.sub(additional);
    }
    if (this.right) {
      let additional = new Vector3();
      additional.copy(right);
      additional.multiplyScalar(directionalFactor);
      this.velocity.add(additional);
    }

    let potentialPosition = new Vector3();
    potentialPosition.copy(this.camera.position);

    let delta = new Vector3();
    delta.copy(this.velocity);
    delta.multiplyScalar(elapsed / 1000);

    potentialPosition.add(delta);

    let start = performance.now();
    let collision = this.checkCollision({
      position: potentialPosition,
      buildingMap: this.buildingMap,
    });
    //console.log("time to check collision: " + (performance.now() - start));

    if (potentialPosition.y < 0 || collision) {
      this.velocity = new Vector3(0, 0, 0);
      this.gravityVel = new Vector3();
      this.boostVel = new Vector3();
      delta = new Vector3();
    }

    this.camera.position.add(delta);

    //this.particleSystem.rotation.y += 0.01;

    if (this.boost) {
      //this.system.particleSystem.visible = true;
      this.system.show();
      this.system.update();
    } else {
      this.system.hide();
      //this.system.particleSystem.visible = false;
    }

    //this.camera.position.set(newX, newY, newZ);
    //this.system.update();
    //this.controls.update();
  }
}
export default MouseGame;
