import * as THREE from "three";
import { Vector3 } from "three";
class ParticleSystem {
  constructor(config) {
    const {
      numParticles,
      velocity,
      lifetime,
      radius,
      startColor,
      stopColor,
      src,
    } = config;

    this.particles = new THREE.Geometry();
    var pMaterial = new THREE.ParticleBasicMaterial({
      //color: THREE.VertexColors,
      color: 0xffffff,
      size: 1,
      map: THREE.ImageUtils.loadTexture(src),
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false,
    });

    // now create the individual particles
    for (var p = 0; p < numParticles; p++) {
      // create a particle with random
      // position values, -250 -> 250

      let pX = radius * Math.random();
      let pY = radius * Math.random();
      let pZ = radius * Math.random();
      let particle = new THREE.Vertex(pX, pY, pZ);

      this.particles.vertices.push(particle);
      this.particles.colors.push(startColor);

      //particle = new THREE.Vertex(new THREE.Vector3(pX, pY, pZ));

      //console.log(pX, pY, pZ);
      // add it to the geometry
      //this.particles.vertices.push(particle);
    }
    this.particles.verticesNeedUpdate = true;

    this.startTime = performance.now() / 1000;
    this.lastTime = this.startTime;

    this.particleSystem = new THREE.Points(this.particles, pMaterial);
    this.particleSystem.sortParticles = true;

    this.velocity = velocity;
    this.lifetime = lifetime;
    this.startColor = startColor;
    this.radius = radius;
  }

  hide() {
    if (this.firstUpdate) {
      this.particleSystem.visible = false;
    }
  }

  show() {
    this.particleSystem.visible = true;
    this.particles.verticesNeedUpdate = true;
  }

  update() {
    this.firstUpdate = true;
    //console.log("update!");
    let now = performance.now() / 1000;
    let elapsed = now - this.startTime;
    let tick = now - this.lastTime;
    this.lastTime = now;

    if (elapsed > this.lifetime) {
      this.startTime = now;

      for (let key in this.particles.vertices) {
        let particle = this.particles.vertices[key];

        let pX = this.radius * Math.random();
        let pY = this.radius * Math.random();
        let pZ = this.radius * Math.random();

        particle.set(pX, pY, pZ);
      }
      this.particles.verticesNeedUpdate = true;
    }

    for (let key in this.particles.vertices) {
      let particle = this.particles.vertices[key];

      let vp = new Vector3();
      vp.copy(this.velocity);
      vp.multiplyScalar(tick);
      particle.add(vp);
      this.particles.vertices[key] = particle;
    }

    for (let key in this.particles.colors) {
      let particle = this.particles.colors[key];
      particle = this.startColor;
      this.particles.colors[key] = this.startColor;
    }

    this.particles.verticesNeedUpdate = true;
  }
}

export default ParticleSystem;
