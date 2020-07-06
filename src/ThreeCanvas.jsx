import { render } from "@testing-library/react";
import React, { useRef, useEffect, useLayoutEffect } from "react";
import * as THREE from "three";

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import makeCity from "./makecity";
import makeCity2 from "./makeCity2";
import MouseGame from "./MouseGame";
import JetGame from "./JetGame";
//const THREE = require("three");

const ThreeCanvas = (props) => {
  console.log("engine render");
  const canvasRef = useRef(null);

  const camera = useRef(null);
  const scene = useRef(null);
  const game = useRef(null);
  const renderer = useRef(null);

  //let camera;
  //let scene;
  //let renderer;
  //let game = null;

  let geometry;
  let material;
  let mesh;
  let controls;
  let renderLoop;

  useEffect(() => {
    setup();
    renderLoop = requestAnimationFrame(animate);
  }, []);

  const setup = () => {
    console.log("setup scene!");

    refreshRenderer();

    camera.current = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight
    );
    camera.current.position.z = 1;

    scene.current = new THREE.Scene();
    window.scene = scene.current;
    window.THREE = THREE;

    // game.current = new MouseGame({
    //   scene: scene.current,
    //   camera: camera.current,
    //   renderer: renderer.current,
    //   element: canvasRef.current,
    // });
    game.current = new JetGame({
      scene: scene.current,
      camera: camera.current,
      renderer: renderer.current,
      element: canvasRef.current,
    });
    //game.current.init();
  };

  const refreshRenderer = () => {
    renderer.current = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
    });
    renderer.current.setSize(window.innerWidth, window.innerHeight);
  };

  const takedown = () => {};

  const animate = () => {
    game.current.update();
    renderer.current.render(scene.current, camera.current);
    renderLoop = requestAnimationFrame(animate);
  };

  // useEffect(() => {
  //   refreshRenderer();
  //   // setup();
  //   return () => {
  //     cancelAnimationFrame(renderLoop);
  //     takedown();
  //   };
  // }, [props]);

  const render = () => {
    return <canvas ref={canvasRef}></canvas>;
  };

  return render();
};
export default ThreeCanvas;
