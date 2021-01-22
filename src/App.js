//bismillah
import React from "react";
import logo from "./logo.svg";
import "./App.css";
import ThreeCanvas from "./ThreeCanvas.jsx";
import {
  BrowserRouter,
  Router,
  Switch,
  Route,
  Link,
  hashHistory,
} from "react-router-dom";
//import TRQ from "./TRQ.jsx";
import Elements from "./Elements.jsx";

function App() {
  return (
    <div className="App">
      {/* <header className="App-header"></header> */}
      <BrowserRouter>
        {/* <Route path="*" component={ThreeCanvas}></Route> */}
        {/* <Route path="*" component={TRQ}></Route> */}
        <Route path="*" component={Elements}></Route>
      </BrowserRouter>
    </div>
  );
}

export default App;
