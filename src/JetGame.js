import * as THREE from "three";
import Game from "./Game";
import GameObject from "./GameObject";
import Networking from "./Networking";

import Map from "./Map";
import Player from "./Player";
import Definitions from "./Definitions";

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

    //stuff for player:
    this.player = new Player(this);

    this.Networking.EE.on("objects", (data) => {
      for (let key in data) {
        if (key != this.mouseID) {
          if (this.objects[key] == null) {
            //create new object
            let type = data[key].type;
            if (Definitions[type]) {
              console.log("creating new", type);
              this.objects[key] = new Definitions[type]({
                game: this,
                data: data[key],
              });
            }
          }

          this.objects[key].networkUpdate(data[key]);
        }
      }

      //remove destroyed objects
      for (let key in this.objects) {
        if (data[key] == null) {
          this.objects[key].remove();
          delete this.objects[key];
        }
      }
    });

    this.Networking.joinGame();
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

    //update player
    this.player.update();

    //update all other objects
    for (let key in this.objects) {
      if (this.objects[key].update) {
        this.objects[key].update();
      }
    }

    //handle network update of player movement
    if (performance.now() - this.lastNetworkUpdate > this.networkUpdatePeriod) {
      this.lastNetworkUpdate = performance.now();

      this.Networking.update({
        id: this.mouseID,
        data: this.mouse.serialize(),
      });
    }
  }
}

export default JetGame;
