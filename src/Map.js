import * as THREE from "three";
import makeCity from "./makecity";
class Map {
  constructor(game) {
    this.game = game;
    const { cityMesh, buildingMap } = makeCity(this.game.renderer);
    this.buildingMap = buildingMap;
    this.game.scene.add(cityMesh);
  }

  checkCollision = (position) => {
    let buildingMap = this.buildingMap;
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

    for (let key in this.game.objects) {
      if (this.game.objects[key].type == "mechaCat") {
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
  };
}
export default Map;
