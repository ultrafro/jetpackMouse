import { render } from "@testing-library/react";
import React, { useRef, useEffect, useState, useLayoutEffect } from "react";
import firebase from "firebase";
import Start from "./Elements/Start";
import PW from "./Elements/PW";
import Victory from "./Elements/Victory";

var firebaseConfig = {
  apiKey: "AIzaSyBUufaP4YVEZogc2-8g6HAS8SMyRStxO80",
  authDomain: "jetmouse-52a3e.firebaseapp.com",
  databaseURL: "https://jetmouse-52a3e.firebaseio.com",
  projectId: "jetmouse-52a3e",
  storageBucket: "jetmouse-52a3e.appspot.com",
  messagingSenderId: "818018271769",
  appId: "1:818018271769:web:844b56d736cfbcb0d4a088",
  measurementId: "G-96W3K45YC6",
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
firebase.analytics();

let gameRef = firebase.database().ref("/ELEMENTS/");
const Elements = () => {
  const [stage, setStage] = useState(0);
  //   const stages = [
  //     <Start onFinish={incrementStage} />,
  //     <PW onFinish={incrementStage} />,
  //     <Victory onFinish={incrementStage} />,
  //     <Dante onFinish={incrementStage} />,
  //   ];

  const incrementStage = () => {
    setStage((stage + 1) % stages.length);
  };

  const stages = [
    <Start onFinish={incrementStage} gameRef={gameRef} />,
    <PW onFinish={incrementStage} gameRef={gameRef} />,
    <Victory onFinish={incrementStage} />,
    // <Dante onFinish={incrementStage} />,
  ];

  return <div>{stages[stage]}</div>;
}; //
export default Elements;
