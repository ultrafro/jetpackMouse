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
      worldSpace,
      emissionRate,
      size,
      src,
    } = config;

    this.velocity = velocity;
    this.lifetime = lifetime;
    this.startColor = startColor;
    this.radius = radius;
    this.worldSpace = worldSpace;
    this.emissionRate = emissionRate;
    this.numParticles = numParticles;
    this.size = size;

    if (this.size == null) {
      this.size = 1;
    }

    if (this.emissionRate == null) {
      this.emissionRate = 10; //particles per second
    }

    if (this.startColor == null) {
      this.startColor = 0xffffff;
    }

    this.particles = new THREE.Geometry();
    var pMaterial = new THREE.ParticleBasicMaterial({
      //color: THREE.VertexColors,
      color: this.startColor,
      size: this.size,
      map: THREE.ImageUtils.loadTexture(src),
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false,
    });

    this.particleList = [];

    this.startParticles();

    this.particleSystem = new THREE.Points(this.particles, pMaterial);
    this.particleSystem.sortParticles = true;
  }

  startParticles() {
    for (var p = 0; p < this.numParticles; p++) {
      // create a particle with random
      // position values, -250 -> 250

      let pX = this.radius * Math.random();
      let pY = this.radius * Math.random();
      let pZ = this.radius * Math.random();
      let particle = new THREE.Vertex(pX, pY, pZ);

      this.particles.vertices.push(particle);
      this.particles.colors.push(this.startColor);

      this.particleList.push({
        vertex: particle,
        creationTime: performance.now() / 1000 + p / this.emissionRate,
        color: this.startColor,
        delay: p / this.emissionRate,
      });

      //particle = new THREE.Vertex(new THREE.Vector3(pX, pY, pZ));

      //console.log(pX, pY, pZ);
      // add it to the geometry
      //this.particles.vertices.push(particle);
    }
    this.particles.verticesNeedUpdate = true;

    this.startTime = performance.now() / 1000;
    this.lastTime = this.startTime;

    this.initialized = true;
  }

  // async startParticles() {
  //   // now create the individual particles
  //   for (var p = 0; p < this.numParticles; p++) {
  //     // create a particle with random
  //     // position values, -250 -> 250

  //     let pX = this.radius * Math.random();
  //     let pY = this.radius * Math.random();
  //     let pZ = this.radius * Math.random();
  //     let particle = new THREE.Vertex(pX, pY, pZ);

  //     this.particles.vertices.push(particle);
  //     this.particles.colors.push(this.startColor);

  //     this.particleList.push({
  //       vertex: particle,
  //       creationTime: performance.now() / 1000,
  //       color: this.startColor,
  //     });

  //     await this.delay((1 / this.emissionRate) * 1000);

  //     //particle = new THREE.Vertex(new THREE.Vector3(pX, pY, pZ));

  //     //console.log(pX, pY, pZ);
  //     // add it to the geometry
  //     //this.particles.vertices.push(particle);
  //   }
  //   this.particles.verticesNeedUpdate = true;

  //   this.startTime = performance.now() / 1000;
  //   this.lastTime = this.startTime;

  //   this.initialized = true;
  // }

  async delay(ms) {
    console.log("delaying: " + ms);
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve();
      }, ms);
    });
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
    if (!this.initialized) {
      return;
    }
    this.firstUpdate = true;
    //console.log("update!");
    let now = performance.now() / 1000;
    let elapsed = now - this.startTime;
    let tick = now - this.lastTime;
    this.lastTime = now;

    for (let i = 0; i < this.particleList.length; i++) {
      let particleInfo = this.particleList[i];
      if (i == 99) {
        //console.log(now - particleInfo.creationTime);
      }
      if (now - particleInfo.creationTime > this.lifetime) {
        if (i == 99) {
          //console.log("resetting");
        }
        let vertex = particleInfo.vertex;

        let pX = this.radius * Math.random();
        let pY = this.radius * Math.random();
        let pZ = this.radius * Math.random();

        vertex.set(pX, pY, pZ);
        particleInfo.creationTime = now;
      } else {
        if (now - particleInfo.creationTime > 0) {
          let vp = new Vector3();
          vp.copy(this.velocity);
          vp.multiplyScalar(tick);
          particleInfo.vertex.add(vp);
        }

        // if (i == 99) {
        //   console.log("adding tick to particle: " + tick);
        // }
        //this.particles.vertices[key] = particle;
      }
    }
    this.particles.verticesNeedUpdate = true;

    // if (elapsed > this.lifetime) {
    //   this.startTime = now;

    //   for (let key in this.particles.vertices) {
    //     let particle = this.particles.vertices[key];

    //     let pX = this.radius * Math.random();
    //     let pY = this.radius * Math.random();
    //     let pZ = this.radius * Math.random();

    //     particle.set(pX, pY, pZ);
    //   }
    //   this.particles.verticesNeedUpdate = true;
    // }

    // for (let key in this.particles.vertices) {
    //   let particle = this.particles.vertices[key];

    //   let vp = new Vector3();
    //   vp.copy(this.velocity);
    //   vp.multiplyScalar(tick);
    //   particle.add(vp);
    //   this.particles.vertices[key] = particle;
    // }

    // for (let key in this.particles.colors) {
    //   let particle = this.particles.colors[key];
    //   particle = this.startColor;
    //   this.particles.colors[key] = this.startColor;
    // }

    // this.particles.verticesNeedUpdate = true;
  }
}

export default ParticleSystem;
