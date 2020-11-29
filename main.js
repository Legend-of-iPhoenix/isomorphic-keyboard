const SEMITONE = 1.05946309436;

const BASELINE = 1046.50; // C6

const synth = new Tone.Synth().toDestination();

function pitch(row, column) {
  return BASELINE * Math.pow(SEMITONE, column + (row % 2)) / Math.pow(Math.sqrt(2), row)
}

function attachListeners(key, row, column) {
  key.onmousedown = async (event) => {
    await Tone.start();
    const now = Tone.now();
    synth.triggerAttackRelease(pitch(row, column), 0.25, now)
  }
  
  key.ontouchstart = async (event) => {
    event.stopPropagation();
    await Tone.start();
    const now = Tone.now();
    synth.triggerAttackRelease(pitch(row, column), 0.25, now)
  }
}

function generate(rows, columns) {
  for (let row = 0; row < rows; ++row) {
    const rowElement = document.createElement("div");
    rowElement.classList = "row";
    for (let column = 0; column < columns; column += 2) {
      const unit = document.createElement("span");
      unit.classList = "unit";
      
      const approachKey = document.createElement("span");
      approachKey.classList = "approachKey";
      attachListeners(approachKey, row, column)
      unit.appendChild(approachKey);
      
      const key = document.createElement("span");
      key.classList = "key";
      attachListeners(key, row, column + 1)
      unit.appendChild(key);
      
      rowElement.appendChild(unit);
    }
    
    document.body.appendChild(rowElement);
  }
}

generate(9, 16);
