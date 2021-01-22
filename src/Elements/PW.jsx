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
      <h2>Enter in the PWs below:</h2>
      {config.map((element) => {
        let bg = checkCorrect(element) ? "green" : "teal";
        return (
          <FlexRow style={{ width: "300px", padding: "30px", margin: "auto" }}>
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
                style={{ width: "100px", height: "100px", float: "left" }}
              />
              <input
                style={{ height: "75px", float: "left" }}
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
    </FlexColumn>
  );
};
export default PW;
