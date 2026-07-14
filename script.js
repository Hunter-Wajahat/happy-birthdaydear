// Confetti Animation Setup
const canvas = document.getElementById('confetti-canvas');
const ctx = canvas.getContext('2d');
let particles = [];
let animationFrameId = null;

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

class ConfettiParticle {
  constructor() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height - canvas.height;
    this.size = Math.random() * 8 + 4;
    this.color = `hsl(${Math.random() * 360}, 95%, 65%)`;
    this.speedX = Math.random() * 4 - 2;
    this.speedY = Math.random() * 6 + 3;
    this.rotation = Math.random() * 360;
    this.rotationSpeed = Math.random() * 6 - 3;
  }
  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    this.rotation += this.rotationSpeed;
    if (this.y > canvas.height) {
      this.y = -20;
      this.x = Math.random() * canvas.width;
    }
  }
  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate((this.rotation * Math.PI) / 180);
    ctx.fillStyle = this.color;
    ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
    ctx.restore();
  }
}

function initConfetti() {
  particles = [];
  for (let i = 0; i < 150; i++) {
    particles.push(new ConfettiParticle());
  }
}

function animateConfetti() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach(p => {
    p.update();
    p.draw();
  });
  animationFrameId = requestAnimationFrame(animateConfetti);
}

// Celebration Sound Synthesizer (Happy Birthday Chime)
function playCelebrationSound() {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    const ctxAudio = new AudioContextClass();
    
    // Notes for opening of "Happy Birthday": C4, C4, D4, C4, F4, E4
    const notes = [
      { f: 261.63, d: 200 }, // C4
      { f: 261.63, d: 200 }, // C4
      { f: 293.66, d: 400 }, // D4
      { f: 261.63, d: 400 }, // C4
      { f: 349.23, d: 400 }, // F4
      { f: 329.63, d: 800 }  // E4
    ];
    
    let time = ctxAudio.currentTime;
    notes.forEach(note => {
      const osc = ctxAudio.createOscillator();
      const gain = ctxAudio.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(note.f, time);
      
      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(0.12, time + 0.03); // Soft attack
      gain.gain.exponentialRampToValueAtTime(0.001, time + note.d / 1000 - 0.03); // Decay
      
      osc.connect(gain);
      gain.connect(ctxAudio.destination);
      
      osc.start(time);
      osc.stop(time + note.d / 1000);
      time += note.d / 1000 + 0.05; // Note duration + short pause
    });
  } catch (e) {
    console.error("Audio synthesis failed:", e);
  }
}

// Core Blowing Logic
let micStream = null;
let audioContext = null;
let analyser = null;
let dataArray = null;
let blowTimer = null;
let isBlowing = false;
let celebrationTriggered = false;

const blowThreshold = 65; // Trigger threshold for blowing sound
const instructionText = document.getElementById('instruction-text');
const volumeMeterBar = document.getElementById('volume-meter-bar');
const volumeMeterOutline = document.getElementById('volume-meter-outline');

// Initialize Tap Fallback (always active)
document.querySelectorAll('.candle').forEach(candle => {
  candle.addEventListener('click', () => {
    if (celebrationTriggered) return;
    const flame = candle.querySelector('.flame');
    if (flame && !flame.classList.contains('extinguished')) {
      flame.classList.add('extinguished');
      checkAllExtinguished();
    }
  });
});

// Request Microphone Access
if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
  navigator.mediaDevices.getUserMedia({ audio: true })
    .then((stream) => {
      micStream = stream;
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      audioContext = new AudioContextClass();
      analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);
      dataArray = new Uint8Array(analyser.frequencyBinCount);
      
      microphone.connect(analyser);
      
      // Start polling volume
      detectBlow();
    })
    .catch((err) => {
      console.warn("Microphone access denied:", err);
      showFallbackMessage();
    });
} else {
  console.warn("Microphone API not supported by browser.");
  showFallbackMessage();
}

function showFallbackMessage() {
  instructionText.innerHTML = "🎤 Mic not available. Tap/Click the candles to blow them out!";
  if (volumeMeterOutline) volumeMeterOutline.style.display = 'none';
}

function detectBlow() {
  if (celebrationTriggered) return;
  
  analyser.getByteFrequencyData(dataArray);
  const volume = dataArray.reduce((a, b) => a + b) / dataArray.length;
  
  // Scale average volume to a percentage for the level meter
  // Max typical volume from getByteFrequencyData is ~100-120
  const maxExpectedVolume = 110;
  const percent = Math.min(100, Math.round((volume / maxExpectedVolume) * 100));
  volumeMeterBar.style.width = `${percent}%`;
  
  if (volume > blowThreshold) {
    volumeMeterBar.classList.add('active-blow');
    if (!isBlowing) {
      isBlowing = true;
      startBlowingFlames();
    }
  } else {
    volumeMeterBar.classList.remove('active-blow');
    if (isBlowing) {
      isBlowing = false;
      stopBlowingFlames();
    }
  }
  
  requestAnimationFrame(detectBlow);
}

function startBlowingFlames() {
  if (blowTimer) clearInterval(blowTimer);
  
  // Extinguish 1 random candle flame every 90ms of sustained blow
  blowTimer = setInterval(() => {
    const activeFlames = Array.from(document.querySelectorAll('.flame:not(.extinguished)'));
    if (activeFlames.length === 0) {
      clearInterval(blowTimer);
      return;
    }
    
    const randomIndex = Math.floor(Math.random() * activeFlames.length);
    const chosenFlame = activeFlames[randomIndex];
    chosenFlame.classList.add('extinguished');
    
    checkAllExtinguished();
  }, 90);
}

function stopBlowingFlames() {
  if (blowTimer) {
    clearInterval(blowTimer);
    blowTimer = null;
  }
}

function checkAllExtinguished() {
  const activeFlames = document.querySelectorAll('.flame:not(.extinguished)');
  if (activeFlames.length === 0 && !celebrationTriggered) {
    celebrationTriggered = true;
    stopBlowingFlames();
    triggerCelebration();
  }
}

function triggerCelebration() {
  // 1. Release Microphone stream resource
  if (micStream) {
    micStream.getTracks().forEach(track => track.stop());
  }
  if (audioContext) {
    audioContext.close().catch(() => {});
  }
  
  // 2. Hide volume meter and update instructions
  if (volumeMeterOutline) volumeMeterOutline.style.display = 'none';
  instructionText.innerHTML = "🎉 All candles blown out! Make a wish! 🎂";
  
  // 3. Show Celebration Text Card
  document.getElementById('birthday-text').classList.add('visible');
  
  // 4. Play Synthesizer Fanfare and trigger Canvas Confetti
  playCelebrationSound();
  initConfetti();
  animateConfetti();
}
