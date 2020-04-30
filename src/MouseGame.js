import * as THREE from "three";

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls";
import pointer from "./pointer";

import makeCity from "./makecity";
import makeCity2 from "./makeCity2";
import LookControls from "./LookControls";
import { Vector3 } from "three";
import ParticleSystem from "./ParticleSystem";
import Rocket from "./Rocket";
import Explosion from "./Explosion";
import Networking from "./Networking";
import Mouse from "./Mouse";
import MechaCat from "./MechaCat";
import Damage from "./Damage";
//import Partykals from "partykals";

class MouseGame {
  constructor({ scene, camera, renderer, element }) {
    this.Networking = new Networking();

    this.lastNetworkUpdate = 0;
    this.networkUpdatePeriod = 50;

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

    this.rocketList = [];

    this.buildingMap = null;
    //console.log("MOUSEGAME CONSTRUCTOR");
  }

  init() {
    this.objects = {};

    //console.log("MOUSEGAME INIT");
    let geometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
    let material = new THREE.MeshNormalMaterial();

    //let mesh = new THREE.Mesh(geometry, material);
    let mesh2 = new THREE.Mesh(geometry, material);
    this.scene.add(this.camera);
    //this.scene.add(mesh);
    this.scene.add(mesh2);

    //this.mouse = mesh;
    this.camera.position.set(0, 100, 0);

    //makeCity2({ scene, steps: 100 });

    var ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    this.scene.add(ambientLight);

    const { cityMesh, buildingMap } = makeCity(this.renderer);
    this.scene.add(cityMesh);

    this.buildingMap = buildingMap;

    this.mouse = new Mouse({ scene: this.scene });
    this.mouseID = this.Networking.add(this.mouse.serialize());
    this.objects[this.mouseID] = this.mouse;

    this.camera.add(this.mouse.object);
    this.mouse.object.position.set(0, 0, -1);

    // this.system = new ParticleSystem({
    //   numParticles: 100,
    //   velocity: new Vector3(0, -10.0, 0),
    //   lifetime: 0.1,
    //   radius: 1,
    //   startColor: new THREE.Color(1, 0, 0),
    //   stopColor: new THREE.Color(1, 0, 0),
    //   src: "smoke.png",
    // });

    // this.scene.add(this.system.particleSystem);
    // mesh.add(this.system.particleSystem);
    // this.system.particleSystem.position.set(-0.5, -2, -4);

    this.controls = new LookControls(this.camera, this.element);
    this.setupKeys();

    // this.mouseID = this.Networking.add(this.serialize(this.camera));
    // this.objects[this.mouseID] = mesh;

    this.Networking.EE.on("objects", (data) => {
      //debugger;
      for (let key in data) {
        if (key != this.mouseID) {
          if (this.objects[key] == null) {
            //debugger;
            //create new object

            if (data[key].type == "mouse") {
              this.objects[key] = new Mouse({ scene: this.scene });
              this.objects[key].networkUpdate(data[key]);
            }

            if (data[key].type == "explosion") {
              this.objects[key] = new Explosion({
                scene: this.scene,
                id: key,
                data: data[key],
                onFinished: (explosion) => {
                  this.Networking.remove(key);
                  if (this.objects[key]) {
                    this.objects[key].remove();
                    delete this.objects[key];
                  }
                },
              });
            }

            if (data[key].type == "damage") {
              this.objects[key] = new Damage({
                scene: this.scene,
                id: key,
                data: data[key],
              });
            }

            if (data[key].type == "mechaCat") {
              this.objects[key] = new MechaCat({
                scene: this.scene,
                game: this,
              });
              this.objects[key].networkUpdate(data[key]);
            }

            if (data[key].type == "rocket") {
              let onCollision = null;
              if (this.Networking.master) {
                onCollision = (rocket, object) => {
                  let newData = { ...data[key] };
                  newData.travel = false;
                  this.Networking.update({ id: key, data: newData });
                  this.makeExplosion(rocket);
                  setTimeout(() => {
                    this.Networking.remove(key);
                  }, 2000);

                  if (object.key) {
                    if (
                      this.objects[object.key] &&
                      this.objects[object.key].type == "mechaCat"
                    ) {
                      this.Networking.reduceHP(object.key);
                    }
                  }
                };
              }

              this.objects[key] = new Rocket({
                game: this,
                scene: this.scene,
                position: new Vector3(data[key].x, data[key].y, data[key].z),
                direction: new Vector3(
                  data[key].dx,
                  data[key].dy,
                  data[key].dz
                ),
                onCollision: onCollision,
              });
            }
          } else {
            this.objects[key].networkUpdate(data[key]);
            //this.objects[key].download(data[key]);
          }
        }
      }

      for (let key in this.objects) {
        if (data[key] == null) {
          this.objects[key].remove();
          delete this.objects[key];
        }
      }
    });

    this.Networking.EE.on("userDisconnect", () => {
      this.Networking.remove(this.mouseID);
      delete this.objects[this.mouseID];
    });

    this.Networking.EE.on("masterChange", this.onMaster);

    this.Networking.joinGame();
  }

  onMaster = async () => {
    if (this.Networking.master) {
      let objects = await this.Networking.getObjects();

      //make sure there are 20 mechacats.
      let mechaCatCount = 0;
      for (let key in objects) {
        if (objects[key].type == "mechaCat") {
          mechaCatCount++;
        }
      }
      for (let i = 0; i < 3 - mechaCatCount; i++) {
        console.log("NEW CAT!");
        let cat = new MechaCat({ scene: this.scene, game: this });
        let catID = this.Networking.add(cat.serialize());
        cat.remove();
        //this.objects[this.catID] = this.cat;
      }
    }
  };

  serialize(object) {
    let val = {};
    val.x = object.position.x.toFixed(3);
    val.y = object.position.y.toFixed(3);
    val.z = object.position.z.toFixed(3);
    val.vx = 0;
    val.vy = 0;
    val.vz = 0;
    val.type = "mouse";

    return val;

    //return JSON.stringify(val);
  }

  setupKeys() {
    document.addEventListener(
      "click",
      function (event) {
        this.makeNewRocket();
      }.bind(this)
    );

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
    let collision = { hit: false, object: null, key: null };

    if (position.y < 0) {
      return { hit: true, object: "floor", key: null };
    }

    for (let key in buildingMap) {
      let building = buildingMap[key];

      //check if position is in building:
      let xdist = Math.abs(position.x - building.x);
      let zdist = Math.abs(position.z - building.z);
      let ydist = position.y - building.scaleY;

      if (xdist < building.scaleX && zdist < building.scaleZ && ydist < 0.5) {
        collision.hit = true;
        collision.object = "building";
        collision.key = null;

        return collision;
      }
    }

    for (let key in this.objects) {
      if (this.objects[key].type == "mechaCat") {
        let cat = this.objects[key].object;
        let xdist = Math.abs(position.x - cat.position.x);
        let zdist = Math.abs(position.z - cat.position.z);
        let ydist = position.y - this.objects[key].height;

        if (xdist < 25 && zdist < 25 && ydist < 0.5) {
          collision.hit = true;
          collision.object = "mechaCat";
          collision.key = key;

          return collision;
        }
      }
    }

    return { hit: false, object: null, key: null };
  }

  makeNewRocket() {
    this.scene.updateMatrixWorld();
    let rocketPosition = new Vector3();
    rocketPosition.setFromMatrixPosition(this.mouse.object.matrixWorld);
    let direction = this.camera.getWorldDirection();
    let data = {
      x: rocketPosition.x,
      y: rocketPosition.y,
      z: rocketPosition.z,
      dx: direction.x,
      dy: direction.y,
      dz: direction.z,
      travel: true,
      type: "rocket",
    };
    this.Networking.add(data);

    // this.rocketList.push(
    //   new Rocket({
    //     game: this,
    //     scene: this.scene,
    //     position: rocketPosition,
    //     direction: this.camera.getWorldDirection(),
    //     onCollision: (rocket) => {
    //       this.makeExplosion(rocket);
    //     },
    //   })
    // );
  }

  makeExplosion(rocket) {
    let data = this.serialize(rocket.mesh);
    data.type = "explosion";
    let explosionID = this.Networking.add(data);
  }

  removeRocket(rocket) {
    const index = this.rocketList.indexOf(rocket);
    if (index > -1) {
      this.rocketList.splice(index, 1);
    }
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

    for (let i = 0; i < this.rocketList.length; i++) {
      this.rocketList[i].update();
    }

    for (let key in this.objects) {
      if (this.objects[key].update) {
        //console.log("updating: " + key);
        this.objects[key].update();
      }
    }

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

    if (potentialPosition.y < 0 || collision.hit) {
      this.velocity = new Vector3(0, 0, 0);
      this.gravityVel = new Vector3();
      this.boostVel = new Vector3();
      delta = new Vector3();
    }

    this.camera.position.add(delta);

    //this.particleSystem.rotation.y += 0.01;

    if (this.boost) {
      //this.system.particleSystem.visible = true;
      this.mouse.jet = true;
      //this.system.show();
      //this.system.update();
    } else {
      this.mouse.jet = false;
      //this.system.hide();
      //this.system.particleSystem.visible = false;
    }

    if (performance.now() - this.lastNetworkUpdate > this.networkUpdatePeriod) {
      this.lastNetworkUpdate = performance.now();

      this.Networking.update({
        id: this.mouseID,
        data: this.mouse.serialize(),
      });

      if (this.Networking.master) {
        for (let key in this.objects) {
          if (this.objects[key].type == "mechaCat") {
            this.Networking.update({
              id: key,
              data: this.objects[key].serialize(),
            });
          }
        }
      }
    }

    //this.camera.position.set(newX, newY, newZ);
    //this.system.update();
    //this.controls.update();
  }
}
export default MouseGame;
