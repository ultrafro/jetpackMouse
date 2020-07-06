import * as THREE from "three";
import Game from "./Game";
import GameObject from "./GameObject";
import Networking from "./Networking";

import makeCity from "./makecity";
import LookControls from "./LookControls";
import { Vector3 } from "three";
import Mouse from "./Mouse";
import Map from "./Map";
import PlayerMovement from "./PlayerMovement";

class JetGame extends Game {
  constructor({ scene, camera, renderer, element }) {
    super({ scene, camera, renderer, element });

    //all the gameObjects
    this.objects = {};

    //handle networking stuff
    this.Networking = new Networking();
    this.lastNetworkUpdate = 0;
    this.networkUpdatePeriod = 50;

    //stuff for the scene:
    this.setupScene();

    //player:
    this.mouse = new Mouse({ scene: this.scene });
    this.objects[this.mouseID] = this.mouse;
    this.camera.add(this.mouse.object);
    this.mouse.object.position.set(0, 0, -1);
    this.mouseID = this.Networking.add(this.mouse.serialize());

    //stuff for movement:
    this.playerMovement = new PlayerMovement(this);
  }

  setupScene = () => {
    this.scene.add(this.camera);
    this.camera.position.set(0, 100, 0);
    var ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    this.scene.add(ambientLight);
    this.map = new Map(this);
  };

  update() {
    super.update();
    this.playerMovement.update();

    if (performance.now() - this.lastNetworkUpdate > this.networkUpdatePeriod) {
      this.lastNetworkUpdate = performance.now();

      this.Networking.update({
        id: this.mouseID,
        data: this.mouse.serialize(),
      });
    }

    for (let key in this.objects) {
      if (this.objects[key].update) {
        this.objects[key].update();
      }
    }
  }
}

export default JetGame;
