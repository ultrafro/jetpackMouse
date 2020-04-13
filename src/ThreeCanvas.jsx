import { render } from "@testing-library/react";
import React, { useRef, useLayoutEffect } from "react";
import * as THREE from "three";

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import makeCity from "./makecity";
import makeCity2 from "./makeCity2";
import MouseGame from "./MouseGame";
//const THREE = require("three");

const ThreeCanvas = (props) => {
  console.log("engine render");
  const canvasRef = useRef(null);
  let camera;
  let scene;
  let renderer;
  let game = null;

  let geometry;
  let material;
  let mesh;
  let controls;
  let renderLoop;

  const setup = () => {
    console.log("setup scene!");
    init();
  };

  const init = () => {
    camera = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight
    );
    camera.position.z = 1;

    scene = new THREE.Scene();
    window.scene = scene;
    window.THREE = THREE;

    renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);

    game = new MouseGame({
      scene,
      camera,
      renderer,
      element: canvasRef.current,
    });
    game.init();

    renderLoop = requestAnimationFrame(animate);
  };

  const takedown = () => {};

  const animate = () => {
    renderLoop = requestAnimationFrame(animate);
    game.update();
    //mesh.rotation.x += 0.01;
    //mesh.rotation.y += 0.02;
    //controls.update();
    renderer.render(scene, camera);
  };

  useLayoutEffect(() => {
    setup();
    return () => {
      cancelAnimationFrame(renderLoop);
      takedown();
    };
  }, [props]);

  const render = () => {
    return <canvas ref={canvasRef}></canvas>;
  };

  return render();
};
export default ThreeCanvas;
