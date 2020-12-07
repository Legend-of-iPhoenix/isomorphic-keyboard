const SEMITONE = 1.05946309436;

const BASELINE = 1046.50; // C6

class MultiSynth {
  constructor(synth=Tone.Synth, numVoices=5) {
    this.availableVoices = [];

    for (let i = 0; i < numVoices; ++i) {
      this.availableVoices.push(new synth().toDestination());
    }

    this.allocation = {};

    this.yPos = {};
    this.detune = {};
  }

  getId(row, column) {
    return row + "_" + column;
  }

  pitch(row, column) {
    return BASELINE * Math.pow(SEMITONE, column + (row % 2)) / Math.pow(Math.sqrt(2), row)
  }

  triggerAttack(row, column) {
    const id = this.getId(row, column);
    if (this.allocation[id] != null) return;

    const voice = this.availableVoices.pop();
    if (voice === undefined) return;

    this.allocation[id] = voice;

    voice.triggerAttack(this.pitch(row, column));
  }

  triggerRelease(row, column) {
    const id = this.getId(row, column);
    const voice = this.allocation[id];
    if (voice == null) return;
    this.allocation[id] = null;

    this.availableVoices.push(voice);

    voice.triggerRelease();
  }

  pitchShiftStart(row, column, y) {
    const id = this.getId(row, column);
    if (this.allocation[id] == null) return;

    this.yPos[id] = y;
    this.detune[id] = 0;
  }

  pitchShiftMove(row, column, y) {
    const id = this.getId(row, column);
    if (this.allocation[id] == null) return;

    const delta = this.yPos[id] - y;

    this.yPos[id] = y;

    this.detune[id] += delta;
    if (Math.abs(this.detune[id]) >= 10) {
      const synth = this.allocation[id];
      synth.setNote(this.pitch(row, column) * (1 + Math.sign(this.detune[id]) * (Math.abs(this.detune[id]) - 10)/200));
    }
  }
}

const synth = new MultiSynth();

function attachListeners(key, row, column) {
  key.onmousedown = key.ontouchstart = async (event) => {
    event.stopPropagation();
    await Tone.start();
    synth.triggerAttack(row, column);
    synth.pitchShiftStart(row, column, event.clientY || event.touches[0].clientY);

    event.preventDefault();
  }

  key.onmousemove = key.ontouchmove = (event) => {
    synth.pitchShiftMove(row, column, event.clientY || event.touches[0].clientY);
  }

  key.onmouseup = key.onmouseleave = key.ontouchend = (event) => {
    synth.triggerRelease(row, column);
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
