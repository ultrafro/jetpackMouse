class Game {
  constructor({ scene, camera, renderer, element }) {
    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;
    this.element = element;
  }

  //called every frame on the local client
  update() {}
}

export default Game;
