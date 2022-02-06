document.querySelector("#audio-start")?.addEventListener("click", async () => {

	await Tone.start();

  document.querySelector("#status").innerHTML = "Audio is ready!";

  const sampler = new Tone.Sampler({
    urls: {
      "C4": "kick.mp3",
      "D4": "snare.mp3",
      "E4": "hat.mp3",
      "F4": "shaker.mp3"
    },
    release: 1,
    baseUrl: "samples/"
  }).toDestination();

  const padButtons = Array.from(document.getElementsByClassName("midi-key"));

  const midiPads = {
    "C4": padButtons[0],
    "D4": padButtons[1],
    "E4": padButtons[2],
    "F4": padButtons[3]
  }

  //----------

  for (i in padButtons) {
    let pad = padButtons[i],
      pitch = pad.value;
    pad.classList.toggle("pad");
    pad.addEventListener("click", (e) => {
      let rect = e.target.getBoundingClientRect(),
        vel = (rect.top-e.clientY+100)/100;
      sampler.triggerAttackRelease(pitch, 1, Tone.immediate(), vel);
      setTimeout(() => { pad.classList.toggle("animate"); }, 150);
      pad.classList.toggle("animate");
    })
  }

  // ----------

  if (navigator.requestMIDIAccess) {
    navigator.requestMIDIAccess().then(success, failure);
  }

  function success(midi) {
    let inputs = midi.inputs.values();
    for (let input = inputs.next(); input && !input.done; input = inputs.next()) {
      input.value.onmidimessage = onMIDIMessage;
    }
  }
  
  function failure () {
    console.error("No access to your midi devices.");
    document.querySelector("#status").innerHTML = "No access to your midi devices.";
  }
  
  function onMIDIMessage (message) {
    let type = message.data[0],
      pitch = midiConvert(message.data[1]),
      vel = message.data[2]/127;
    if (type === 144 && vel > 0 && (pitch in midiPads)) {
      sampler.triggerAttackRelease(pitch, 1, Tone.immediate(), vel);
      setTimeout(() => { midiPads[pitch].classList.toggle("animate"); }, 100);
      midiPads[pitch].classList.toggle("animate");
    }
  }

  function midiConvert(p) {
    let chromatic = [ "C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"],
      name = chromatic[p%12], 
      oct = Math.floor(p/12)-1;
    return name + oct
  }

})