import React, { useRef, useEffect, useState, useLayoutEffect } from "react";

export const FlexRow = (props) => {
  return (
    <div style={{ display: "flex", flexDirection: "row" }} {...props}>
      {" "}
      {props.children}{" "}
    </div>
  );
};

export const FlexColumn = (props) => {
  return (
    <div style={{ display: "flex", flexDirection: "column" }} {...props}>
      {" "}
      {props.children}{" "}
    </div>
  );
};
