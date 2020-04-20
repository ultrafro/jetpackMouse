import firebase from "firebase";
import EventEmitter from "eventemitter3";

class Networking {
  constructor() {
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

    this.EE = new EventEmitter();

    this.handleURL();
    this.joinGame();
    //debugger;
    //console.log("NETWORKING CONSTRUCTOR");
  }

  joinGame = () => {
    this.userID = this.newID();

    let usersRef = firebase.database().ref(this.gameID + "/users");
    let val = {};
    val[this.userID] = true;
    usersRef.set(val);
    usersRef.onDisconnect().remove();

    usersRef.on(
      "value",
      function (snapshot) {
        //change to the users
        console.log("change to the users!");

        //find greatest user id:
        let userDict = snapshot.val();
        let firstID = Object.keys(userDict)[0];
        if (this.userID == firstID) {
          console.log("IM THE MASTER");
          if (!this.master) {
            this.master = true;
            //emit master change;
            this.EE.emit("masterChange", true);
          }
        } else {
          if (this.master) {
            this.master = false;
            //emit master change;
            this.EE.emit("masterChange", false);
          }
        }
      }.bind(this)
    );

    let objectsRef = firebase.database().ref(this.gameID + "/objects");
    objectsRef.on(
      "value",
      ((snapshot) => {
        this.EE.emit("objects", snapshot.val());
      }).bind(this)
    );
  };

  add = (data) => {
    let id = this.newID();
    let objectsRef = firebase.database().ref(this.gameID + "/objects");
    let val = {};
    val[id] = data;
    objectsRef.update(val);

    return id;
  };

  update = ({ id, data }) => {
    let objectsRef = firebase.database().ref(this.gameID + "/objects");
    let val = {};
    val[id] = data;
    objectsRef.update(val);
  };

  remove = (id) => {
    let objectsRef = firebase.database().ref(this.gameID + "/objects/" + id);
    objectsRef.remove();
  };

  newID = () => {
    return (
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    );
  };

  handleURL = () => {
    let currentURL = window.location.href;

    let parts = currentURL.split("gameID:");
    if (parts.length < 2) {
      let gameID = this.newID();
      window.location.href = parts[0] + "gameID:" + gameID;
    } else {
      let gameID = parts[1];
      console.log("game id: " + gameID);
      this.gameID = gameID;
    }
  };
}
export default Networking;
