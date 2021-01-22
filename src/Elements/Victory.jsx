import React, { useRef, useEffect, useState, useLayoutEffect } from "react";
import { FlexRow, FlexColumn } from "./Flex";

const Victory = ({ onFinish }) => {
  const videoRef = useRef(null);
  const audioRef = useRef(null);
  //   useEffect(() => {
  //     setTimeout(() => {
  //       if (onFinish) {
  //         onFinish();
  //       }
  //     }, 2000);
  //   }, []);

  return (
    <FlexColumn
      style={{
        width: "100vw",
        height: "100vh",
        backgroundImage: 'url("bg3.jpg")',
      }}
    >
      <h5>Well done ;)</h5>
      <h5>Now Make sure your audio is on :)</h5>
      <video ref={videoRef} src="/zukoCrop.mp4"></video>
      <p></p>
      <button
        style={{
          margin: "auto",
          backgroundColor: "teal",
          borderRadius: "20px",
          width: "100px",
          height: "100px",
        }}
        onClick={() => {
          if (videoRef.current) {
            videoRef.current.play();
          }
          setTimeout(() => {
            if (audioRef.current) {
              audioRef.current.play();
            }
          }, 24000);
        }}
      >
        Play!
      </button>
      <audio
        ref={audioRef}
        // controls
        // loop
        style={{ margin: "auto", width: "50%" }}
      >
        <source src="love.mp3" type="audio/mpeg"></source>
      </audio>
    </FlexColumn>
  );
};
export default Victory;
