import React, { useRef, useEffect, useState, useLayoutEffect } from "react";
import { FlexRow, FlexColumn } from "./Flex";
const Start = ({ onFinish, gameRef }) => {
  return (
    <FlexColumn
      style={{
        width: "100vw",
        height: "100vh",
        backgroundImage: 'url("bg3.jpg")',
      }}
    >
      <FlexColumn>
        <h4>Welcome to the Scavenger hunt!</h4>
        <h4>Find the 4 element cards to win</h4>
        <h4>Then enter the passwords on the next screen</h4>
        <h4>Make sure your audio is on :)</h4>
      </FlexColumn>

      <button
        style={{
          margin: "auto",
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
    </FlexColumn>
  );
};
export default Start;

// const [gameState, setGameState] = useState(null);
// const [name, setName] = useState(null);

// const changeListener = (snapshot) => {
//   console.log("GOT !", snapshot.val());
//   setGameState(snapshot.val());
// };

// useEffect(() => {
//   gameRef.on("value", changeListener);

//   return () => {
//     gameRef.off("value", changeListener);
//   };
// }, []);

// return (
//   <div style={{ display: "flex", flexDirection: "column" }}>
//     Users currently in game:
//     <p></p>
//     {gameState &&
//       gameState.users &&
//       Object.keys(gameState.users).map((val) => {
//         return (
//           <p>
//             {val} - {name === "superAdmin12" && gameState.users[val]}
//           </p>
//         );
//       })}
//     <input
//       type="text"
//       onChange={(evt) => {
//         setName(evt.target.value);
//       }}
//     ></input>
//     <button
//       onClick={() => {
//         firebase.database().ref(`/TRQ/users/${name}/`).set("notAssigned");
//       }}
//     >
//       {" "}
//       JOIN GAME
//     </button>
//     {gameState && !gameState.started && "GAME HAS NOT STARTED YET"}
//     {gameState && gameState.started && (
//       <p>My TEAM Assignment: {gameState.users[name]} </p>
//     )}
//     {name === "superAdmin12" && (
//       <div style={{ display: "flex", flexDirection: "column" }}>
//         <button
//           onClick={() => {
//             firebase.database().ref(`/TRQ/users/`).set(null);
//             firebase.database().ref(`/TRQ/started`).set(false);
//           }}
//         >
//           Clear Users
//         </button>
//         <button
//           onClick={() => {
//             let newGame = { ...gameState };

//             let length = Object.keys(newGame.users).length;
//             let presidentIdx = Math.floor(Math.random() * length);
//             let bomberIdx = (presidentIdx + 1) % length;
//             let presidentKey = Object.keys(newGame.users)[presidentIdx];
//             let bomberKey = Object.keys(newGame.users)[bomberIdx];

//             for (let key in newGame.users) {
//               if (key === presidentKey) {
//                 newGame.users[key] =
//                   "president, blue team, dont tell red team";
//               } else {
//                 if (key === bomberKey) {
//                   newGame.users[key] =
//                     "bomber, red team, dont tell blue team";
//                 } else {
//                   if (Math.random() > 0.5) {
//                     newGame.users[key] = "red, dont tell blue team";
//                   } else {
//                     newGame.users[key] = "blue, dont tell red team";
//                   }
//                 }
//               }
//             }
//             firebase.database().ref(`/TRQ/`).set(newGame);
//             firebase.database().ref(`/TRQ/started`).set(true);
//           }}
//         >
//           Assign Users
//         </button>
//       </div>
//     )}
//   </div>
// );
