import { render } from "@testing-library/react";
import React, { useRef, useLayoutEffect } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

const ThreeCanvas = (props) => {
  console.log("engine render");
  const canvasRef = useRef(null);
  let camera;
  let scene;
  let renderer;
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

    geometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
    material = new THREE.MeshNormalMaterial();

    mesh = new THREE.Mesh(geometry, material);
    let mesh2 = new THREE.Mesh(geometry, material);
    scene.add(camera);
    scene.add(mesh);
    scene.add(mesh2);
    camera.add(mesh);

    mesh.position.set(0, 0, -1);

    renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);

    controls = new OrbitControls(camera, canvasRef.current);

    renderLoop = requestAnimationFrame(animate);
  };

  const takedown = () => {};

  const animate = () => {
    renderLoop = requestAnimationFrame(animate);
    console.log("loop");
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
