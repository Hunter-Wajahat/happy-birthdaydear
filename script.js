// Check for microphone support
if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
  console.log("Microphone access supported!");

  // Access the user's microphone
  navigator.mediaDevices.getUserMedia({ audio: true })
    .then((stream) => {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);
      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      microphone.connect(analyser);

      const flames = document.querySelectorAll('.flamec'); // Select all flame elements
      let blowThreshold = 90; // Adjust threshold based on mic sensitivity




      // Detect "blow" sound
      function detectBlow() {
        analyser.getByteFrequencyData(dataArray); // Get sound frequency data
        let volume = dataArray.reduce((a, b) => a + b) / dataArray.length; // Calculate average volume

        if (volume > blowThreshold) {
          console.log("Blow detected! Volume:", volume);
          blowOutCandles();
        }

        requestAnimationFrame(detectBlow); // Continuously check for sound
      }




      // Function to blow out all candles
      function blowOutCandles() {
        flames.forEach((flame) => {
          flame.style.opacity = 0; // Trigger fade-out by setting opacity to 0
        }); // Hide all flames
        // setTimeout(() => {
        //   alert("All candles blown out! 🎉");
        // }, 500);
      }

      detectBlow(); // Start listening for sound
    })

    .catch((err) => {
      // const heading = document.body.getElementsByTagName('h1')
      console.error("Microphone access denied:", err);
      // alert("Microphone access is required to blow out the candles.");
      const heading = document.querySelector('.head')
      heading.innerHTML = 'Give acces of mic'
    });
} else {
  const heading = document.querySelector('.head')
  heading.innerHTML = 'Give acces of mic'
  alert("Sorry, your browser doesn't support microphone access.");
}
