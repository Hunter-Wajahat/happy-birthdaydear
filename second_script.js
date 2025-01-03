
  
    // Access the user's microphone
  
        const flames = document.querySelectorAll('.center_flames'); // Select all flame elements
        let blowThreshold = 60; // Adjust threshold based on mic sensitivity
        navigator.mediaDevices.getUserMedia({ audio: true })
        .then((stream) => {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const analyser = audioContext.createAnalyser();
        const microphone = audioContext.createMediaStreamSource(stream);
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
  
        microphone.connect(analyser);
        
   

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
        detectBlow(); // Start listening for sound

      })

  
        // Function to blow out all candles
        function blowOutCandles() {
          flames.forEach((flame) => {
            flame.style.opacity = 0; // Trigger fade-out by setting opacity to 0
          }); // Hide all flames
          setTimeout(() => {
            // alert("All candles blown out! 🎉");
          }, 500);
        }
  
        


  