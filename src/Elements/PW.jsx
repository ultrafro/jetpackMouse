import React, { useRef, useEffect, useState, useLayoutEffect } from "react";
import { FlexRow, FlexColumn } from "./Flex";

export const config = [
  { key: "earth", icon: "earth.png", pw: "questiongame" }, //earth
  { key: "water", icon: "water.png", pw: "firecracker" }, //water
  { key: "fire", icon: "fire.png", pw: "scooter" }, //fire
  { key: "air", icon: "air.png", pw: "igloo" }, //air
];

const PW = ({ onFinish, gameRef }) => {
  const [dbState, setDbState] = useState(null);

  const changeListener = (snapshot) => {
    console.log("GOT !", snapshot.val());
    setDbState(snapshot.val());
  };

  useEffect(() => {
    gameRef.on("value", changeListener);

    return () => {
      gameRef.off("value", changeListener);
    };
  }, []);

  const isComplete = () => {
    if (!dbState) {
      return false;
    }

    for (let ckey in config) {
      let element = config[ckey];
      if (!checkCorrect(element)) {
        return false;
      }
    }
    return true;
  };

  const checkCorrect = (element) => {
    let result =
      dbState &&
      dbState[element.key] &&
      element.pw &&
      element.pw.toUpperCase() === dbState[element.key].toUpperCase();
    return result;
  };

  return (
    <FlexColumn
      style={{
        width: "100vw",
        height: "100vh",
        backgroundImage: 'url("bg3.jpg")',
      }}
    >
      <h4>Enter in the PWs below:</h4>
      {isComplete() && (
        <button
          style={{
            backgroundColor: "teal",
            borderRadius: "20px",
            width: "100px",
            height: "100px",
          }}
          onClick={() => {
            if (onFinish) {
              onFinish();
            }
          }}
        >
          {" "}
          Start!
        </button>
      )}
      {config.map((element) => {
        let bg = checkCorrect(element) ? "green" : "teal";
        return (
          <FlexRow style={{ width: "300px", padding: "10px", margin: "auto" }}>
            <FlexRow
              style={{
                backgroundColor: bg,
                overflow: "hidden",
                justifyContent: "space-between",
                borderRadius: "20px",
              }}
            >
              <img
                src={element.icon}
                style={{ width: "50px", height: "50px", float: "left" }}
              />
              <input
                style={{ height: "50px", float: "left" }}
                value={
                  dbState && dbState[element.key] ? dbState[element.key] : ""
                }
                type="text"
                onChange={(event) => {
                  let text = event.target.value;
                  gameRef.child(`${element.key}`).set(text);
                }}
              />
            </FlexRow>
          </FlexRow>
        );
      })}
    </FlexColumn>
  );
};
export default PW;
