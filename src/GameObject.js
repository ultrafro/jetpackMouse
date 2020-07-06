class GameObject {
  constructor({ scene, game }) {
    this.scene = scene;
    this.game = game;
  }

  //called every frame on the local client
  update = () => {};

  //called when this GameObject is removed from the local client
  remove = () => {};

  //serializes GameObject state to a simple JS object for storing on the database
  serialize = () => {};

  //called when there is an update to this object's database data
  networkUpdate = (data) => {};
}

export default GameObject;
