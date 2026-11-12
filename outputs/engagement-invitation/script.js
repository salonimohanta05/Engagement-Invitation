const overlay = document.getElementById("envelopeOverlay");
const waxSeal = document.getElementById("waxSeal");
const sparkleLayer = document.getElementById("sparkleLayer");
const monogramImage = document.getElementById("monogramImage");
const scratchCard = document.getElementById("scratchCard");
const scratchCanvas = document.getElementById("scratchCanvas");
const scratchStatus = document.getElementById("scratchStatus");
const blessingForm = document.getElementById("blessingForm");
const guestName = document.getElementById("guestName");
const guestMessage = document.getElementById("guestMessage");
const messages = document.getElementById("messages");

const bgMusic = document.getElementById("bgMusic");
const musicToggle = document.getElementById("musicToggle");
let isPlaying = false;

const STORAGE_KEY = "nikita-subham-blessings";
let monogramAttemptedJpg = false;
let scratchRevealed = false;
let isScratching = false;
let scratchContext;

let audioCtx = null;
let audioBuffer = null;
let currentSource = null;
let isAudioPlaying = false;

// Preload and decode the audio data into memory
async function loadAudioBuffer(url) {
  try {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
  } catch (err) {
    console.error("Audio load error:", err);
  }
}

// Start seamless looping
function playSeamlessLoop(volume = 10.0) {
  if (!audioCtx || !audioBuffer) return;

  // Resume context if suspended by browser autoplay policy
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }

  // Create source and gain (volume) nodes
  currentSource = audioCtx.createBufferSource();
  const gainNode = audioCtx.createGain();

  currentSource.buffer = audioBuffer;
  currentSource.loop = true; // Web Audio API loops sample-accurately with 0ms gap

  gainNode.gain.setValueAtTime(volume, audioCtx.currentTime);

  currentSource.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  currentSource.start(0);
  isAudioPlaying = true;
}

// Load audio right away on page ready
window.addEventListener("DOMContentLoaded", () => {
  // Replace with your actual audio filename
  loadAudioBuffer("Ishq Sufiyana - Piano Cover Gurbani Bhatia - Magical Fingers - Pop Chartbusters (128k).mp3");
});

document.body.classList.add("no-scroll");

if (monogramImage) {
  monogramImage.addEventListener("error", () => {
    if (!monogramAttemptedJpg) {
      monogramAttemptedJpg = true;
      monogramImage.src = "monogram.jpg";
    } else {
      monogramImage.alt = "";
    }
  });
}

waxSeal.addEventListener("click", openEnvelope);

function openEnvelope() {
  const rect = waxSeal.getBoundingClientRect();
  const origin = {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2
  };

  // Play background music with a slight delay
  const bgMusic = document.getElementById("bgMusic");
  if (bgMusic) {
    bgMusic.volume = 0.12;
    setTimeout(() => {
      bgMusic.play().catch((err) => {
        console.error("Audio playback error:", err);
      });
    }, 800); // 800ms delay (adjust to 600ms–1200ms as preferred)
  }

  // 1. Trigger flap opening and golden light
  overlay.classList.add("opening");
  overlay.querySelector(".envelope")?.classList.add("opening");

  // 2. Explode golden and rose-gold confetti
  burstConfetti(origin.x, origin.y, 500);
  
  // 3. Smooth transition to full page after light & confetti burst
  window.setTimeout(() => {
    overlay.classList.add("hidden");
    document.body.classList.remove("no-scroll");
    document.body.classList.add("envelope-opened");
  }, 1500);
}



// Confetti Generator
function burstConfetti(x, y, count = 50) {
  const colors = ["#FFD700", "#D4AF37", "#ECC0B5", "#C58A7A", "#FFFFFF", "#FFF3A8"];
  
  for (let i = 0; i < count; i++) {
    const confetti = document.createElement("span");
    confetti.className = "confetti-particle";
    
    // Random angle & explosion distance
    const angle = Math.random() * Math.PI * 2;
    const distance = 90 + Math.random() * 220;
    const tx = Math.cos(angle) * distance;
    const ty = Math.sin(angle) * distance - 40; // upward bias
    const rot = Math.random() * 720 - 360;
    
    // Size & Shape (mix of rectangles and squares)
    const width = 6 + Math.random() * 8;
    const height = 4 + Math.random() * 10;
    
    confetti.style.left = `${x}px`;
    confetti.style.top = `${y}px`;
    confetti.style.width = `${width}px`;
    confetti.style.height = `${height}px`;
    confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    confetti.style.setProperty("--tx", `${tx}px`);
    confetti.style.setProperty("--ty", `${ty}px`);
    confetti.style.setProperty("--rot", `${rot}deg`);
    
    document.body.appendChild(confetti);
    
    // Clean up DOM after animation finishes
    window.setTimeout(() => confetti.remove(), 2000);
  }
}

function createParticleBurst(x, y, count, className) {
  const colors = ["#D4AF37", "#FFE8A3", "#B76E79", "#FFF8E7"];

  for (let i = 0; i < count; i += 1) {
    const particle = document.createElement("span");
    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.45;
    const distance = 80 + Math.random() * (maxSparkleRadius - 60);
    const size = 5 + Math.random() * 9;

    particle.className = className;
    particle.style.setProperty("--x", `${x}px`);
    particle.style.setProperty("--y", `${y}px`);
    particle.style.setProperty("--dx", `${Math.cos(angle) * distance}px`);
    particle.style.setProperty("--dy", `${Math.sin(angle) * distance}px`);
    particle.style.setProperty("--size", `${size}px`);
    particle.style.setProperty("--color", colors[Math.floor(Math.random() * colors.length)]);

    sparkleLayer.appendChild(particle);
    particle.addEventListener("animationend", () => particle.remove(), { once: true });
  }
}

function setupScratchCanvas() {
  const dpr = Math.max(window.devicePixelRatio || 1, 1);
  const rect = scratchCard.getBoundingClientRect();
  scratchCanvas.width = Math.floor(rect.width * dpr);
  scratchCanvas.height = Math.floor(rect.height * dpr);
  scratchContext = scratchCanvas.getContext("2d", { willReadFrequently: true });
  scratchContext.setTransform(dpr, 0, 0, dpr, 0, 0);

  drawFoil(rect.width, rect.height);
}

function drawFoil(width, height) {
  const gradient = scratchContext.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, "#fff1a8");
  gradient.addColorStop(0.34, "#D4AF37");
  gradient.addColorStop(0.64, "#f7d96d");
  gradient.addColorStop(1, "#b98f18");

  scratchContext.globalCompositeOperation = "source-over";
  scratchContext.fillStyle = gradient;
  scratchContext.fillRect(0, 0, width, height);

  scratchContext.fillStyle = "rgba(255, 255, 255, 0.22)";
  for (let x = -height; x < width; x += 24) {
    scratchContext.beginPath();
    scratchContext.moveTo(x, height);
    scratchContext.lineTo(x + height, 0);
    scratchContext.lineTo(x + height + 8, 0);
    scratchContext.lineTo(x + 8, height);
    scratchContext.closePath();
    scratchContext.fill();
  }

  scratchContext.fillStyle = "#fffaf0";
  scratchContext.textAlign = "center";
  scratchContext.textBaseline = "middle";
  scratchContext.font = "700 18px Inter, Arial, sans-serif";
  wrapCanvasText("Scratch Here to Reveal the Date ", width / 2, height / 2, width - 48, 25);
}

function wrapCanvasText(text, x, y, maxWidth, lineHeight) {
  const words = text.split(" ");
  const lines = [];
  let currentLine = "";

  words.forEach((word) => {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    if (scratchContext.measureText(testLine).width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  });

  lines.push(currentLine);
  const startY = y - ((lines.length - 1) * lineHeight) / 2;
  lines.forEach((line, index) => {
    scratchContext.fillText(line, x, startY + index * lineHeight);
  });
}

function getScratchPoint(event) {
  const rect = scratchCanvas.getBoundingClientRect();
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top
  };
}

function scratchAt(point) {
  scratchContext.globalCompositeOperation = "destination-out";
  scratchContext.beginPath();
  scratchContext.arc(point.x, point.y, 22, 0, Math.PI * 2);
  scratchContext.fill();
}

function calculateScratchPercent() {
  const ImageData = scratchContext.getImageData(0, 0, scratchCanvas.width,scratchCanvas.height);
  const pixels = ImageData.data;
  let transparent = 0;

  for (let i = 3; i < pixels.length; i += 4) {
    if (pixels[i] < 80) {
      transparent += 1;
    }
  }

  return transparent / (pixels.length / 4);
}


function revealScratchCard() {
  if (scratchRevealed) return;
  scratchRevealed = true;

  scratchCanvas.style.transition = "opacity 420ms ease";
  scratchCanvas.style.opacity = "0";

  if (scratchStatus) {
    scratchStatus.textContent = "13th December 2026 is revealed. We cannot wait to celebrate with you.";
  }

  const rect = scratchCard.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  // 🎊 Massive confetti burst using your main burstConfetti function
  burstConfetti(centerX, centerY, 100);

  setTimeout(() => {
    burstConfetti(rect.left + 30, centerY, 40);
    burstConfetti(rect.right - 30, centerY, 40);
  }, 140);
}

scratchCanvas.addEventListener("pointerdown", (event) => {
  if (scratchRevealed) return;
  isScratching = true;
  scratchCanvas.setPointerCapture(event.pointerId);
  scratchAt(getScratchPoint(event));
});

scratchCanvas.addEventListener("pointermove", (event) => {
  if (!isScratching || scratchRevealed) return;
  scratchAt(getScratchPoint(event));

  if (calculateScratchPercent() >= 0.5) {
    revealScratchCard();
  }
});

scratchCanvas.addEventListener("pointerup", () => {
  isScratching = false;
});

scratchCanvas.addEventListener("pointercancel", () => {
  isScratching = false;
});

function getBlessings() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveBlessings(blessings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(blessings));
}

function renderBlessings() {
  const blessings = getBlessings();
  messages.innerHTML = "";

  if (!blessings.length) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = "Be the first to leave a blessing for the couple.";
    messages.appendChild(empty);
    return;
  }

  blessings.forEach((blessing) => {
    const card = document.createElement("article");
    const name = document.createElement("strong");
    const message = document.createElement("p");

    card.className = "message-card";
    name.textContent = blessing.name;
    message.textContent = blessing.message;

    card.append(name, message);
    messages.appendChild(card);
  });
}

const SCRIPT_URL="https://script.google.com/macros/s/AKfycbz3ZgbKGqk56wub4IGnwMfKKWGgsFw3musSXVYK7uqa644u0LDLwwAoVRivoPaF7Ub3/exec"
if (blessingForm) {
    blessingForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const nameInput = blessingForm.querySelector('input[type="text"], #name, [name="name"]');
      const messageInput = blessingForm.querySelector('textarea, #message, [name="message"]');

      const guestName = nameInput ? nameInput.value.trim() : "Well Wisher";
      const guestMessage = messageInput ? messageInput.value.trim() : "";

      const container = document.getElementById("doveFlightContainer");
      const video = document.getElementById("doveVideo");
      const wishesToast = document.getElementById("wishesToast");

      if (container && video) {
        // Reset and force baseline properties
        container.className = "";
        container.style.cssText = [
          "position: fixed !important",
          "left: 50% !important",
          "bottom: 20% !important",
          "width: 240px !important",
          "height: 240px !important",
          "display: flex !important",
          "align-items: center !important",
          "justify-content: center !important",
          "pointer-events: none !important",
          "z-index: 9999999 !important",
          "opacity: 1 !important",
          "visibility: visible !important"
        ].join(";");

        // Play video
        video.currentTime = 0;
        video.playbackRate = 2.0;
        video.play().catch((err) => console.warn(err));

        // Natural diagonal flight to top-right corner for mobile screens
        const flightAnim = container.animate([
          { 
            transform: "translate(-50%, 0) rotate(0deg) scale(0.55)", 
            opacity: 0 
          },
          { 
            transform: "translate(calc(-50% + 10vw), -20vh) rotate(12deg) scale(0.8)", 
            opacity: 1, 
            offset: 0.2 
          },
          { 
            transform: "translate(calc(-50% + 28vw), -50vh) rotate(18deg) scale(0.95)", 
            opacity: 1, 
            offset: 0.6 
          },
          { 
            /* Exits precisely through the top-right corner */
            transform: "translate(calc(-50% + 55vw), -85vh) rotate(22deg) scale(1.1)", 
            opacity: 0, 
            offset: 1.0 
          }
        ], {
          duration: 3400,
          easing: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
          fill: "forwards"
        });

        flightAnim.onfinish = () => {
          container.style.display = "none";
          video.pause();
        };
      }

      if (wishesToast) {
        wishesToast.classList.add("active");
      }

    // Send data asynchronously to Google Sheets
    fetch(SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: guestName,
        message: guestMessage
      })
    }).catch((err) => console.error("Sheet save error:", err));

    blessingForm.reset();

      setTimeout(() => {
        if (wishesToast) wishesToast.classList.remove("active");
      }, 4200);
    });
  }

setupScratchCanvas();
//renderBlessings();
