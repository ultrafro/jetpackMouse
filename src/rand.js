var seed = 1;

function rand() {
  var x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

export default rand;
