const participantsInput = document.querySelector("#participantInput");
const participantCount = document.querySelector("#participantCount");
const sortParticipantsButton = document.querySelector("#sortParticipants");
const shuffleParticipantsButton = document.querySelector("#shuffleParticipants");
const clearParticipantsButton = document.querySelector("#clearParticipants");
const prizeNameInput = document.querySelector("#prizeName");
const prizeImageInput = document.querySelector("#prizeImage");
const addPrizeButton = document.querySelector("#addPrize");
const prizeList = document.querySelector("#prizeList");
const prizeCount = document.querySelector("#prizeCount");
const activePrizeSelect = document.querySelector("#activePrize");
const activePrizeImage = document.querySelector("#activePrizeImage");
const activePrizeName = document.querySelector("#activePrizeName");
const heroPrizeImage = document.querySelector("#heroPrizeImage");
const heroPrizeName = document.querySelector("#heroPrizeName");
const wheelCanvas = document.querySelector("#wheelCanvas");
const spinButton = document.querySelector("#spinButton");
const shareButton = document.querySelector("#shareButton");
const shareOutput = document.querySelector("#shareOutput");
const shareLink = document.querySelector("#shareLink");
const shareStatus = document.querySelector("#shareStatus");
const resetWinnerButton = document.querySelector("#resetWinner");
const winnerDialog = document.querySelector("#winnerDialog");
const winnerTitle = document.querySelector("#winnerTitle");
const winnerPrizeImage = document.querySelector("#winnerPrizeImage");
const winnerPrizeName = document.querySelector("#winnerPrizeName");
const closeWinnerButton = document.querySelector("#closeWinner");
const playAgainButton = document.querySelector("#playAgain");

const ctx = wheelCanvas.getContext("2d");
const colors = ["#0f766e", "#22c55e", "#84cc16", "#16a34a", "#14b8a6", "#65a30d"];
const storageKey = "ruleta-premios-config";
const publicAppUrl = "https://colono-agropecuario.github.io/rifa-cafe-altura/";
const spinDuration = 10000;
const previousSampleParticipants = [
  "Andrea",
  "Carlos",
  "Mariana",
  "Jose",
  "Valeria",
  "Luis",
  "Gabriela",
  "Sofia",
  "Daniel",
  "Natalia",
  "Fernando",
  "Paula",
];
const sampleParticipants = [
  "ARIAS SALAS GUILLERMO",
  "SERGIO FERNANDEA RAMIREZ",
  "ROJAS JIMENEZ ROGELIO",
  "SAEZ AGRICOLA SOCIEDAD ANONIMA",
  "FELIX ANGEL MATAMOROS ARAYA",
  "TINOCO RUBIO PEDRO",
  "VEGA OVARES GODOFREDO MARTIN",
  "VEGA OVARES LIDIETH DE LA TRINIDAD",
  "JIMENEZ QUIROS EVELIO",
  "MARIO ALBERTO ARIAS SALAS",
  "VENTURA RODRIGUEZ VASQUEZ",
  "MAGDALENA ROJAS CASTRO",
  "DIEGO CASTRO ULATE",
  "Murillo Espinoza Gilgerth",
  "VEGA OVARES IRMA MARIA",
  "MARCONY MARIN",
];

const defaultPrizes = [
  {
    id: crypto.randomUUID(),
    name: 'Smart TV 55"',
    image:
      "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 600'><rect width='800' height='600' fill='%23101827'/><rect x='90' y='90' width='620' height='350' rx='22' fill='%232d3748'/><rect x='125' y='125' width='550' height='280' rx='14' fill='%2338cfd0'/><path d='M240 470h320l40 70H200z' fill='%234b5563'/><circle cx='610' cy='180' r='58' fill='%23ffe45b'/><path d='M125 405L300 250l115 95 96-72 164 132z' fill='%236e73ee'/></svg>",
  },
  {
    id: crypto.randomUUID(),
    name: "Cena para dos",
    image:
      "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 600'><rect width='800' height='600' fill='%23fff4e8'/><circle cx='400' cy='320' r='190' fill='%23ffffff' stroke='%23d9dee8' stroke-width='22'/><circle cx='400' cy='320' r='110' fill='%23ff6868'/><rect x='160' y='105' width='36' height='360' rx='18' fill='%23657083'/><rect x='612' y='105' width='36' height='360' rx='18' fill='%23657083'/><path d='M610 105h40v130h-40z' fill='%23657083'/><circle cx='520' cy='168' r='44' fill='%23ffe45b'/></svg>",
  },
  {
    id: crypto.randomUUID(),
    name: "Audifonos premium",
    image:
      "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 600'><rect width='800' height='600' fill='%23eef2ff'/><path d='M220 330c0-130 76-220 180-220s180 90 180 220' fill='none' stroke='%23101827' stroke-width='46' stroke-linecap='round'/><rect x='145' y='300' width='128' height='180' rx='44' fill='%23d61b98'/><rect x='527' y='300' width='128' height='180' rx='44' fill='%2338cfd0'/><circle cx='400' cy='430' r='60' fill='%23ffe45b'/></svg>",
  },
];

let prizes = [...defaultPrizes];
let rotation = 0;
let isSpinning = false;
let audioContext;
let spinSoundTimer;
let spinSoundEndsAt = 0;
let pendingActivePrizeId = null;
const activeSoundStops = new Set();

function getParticipants() {
  return participantsInput.value
    .split(/\r?\n/)
    .map((name) => name.trim())
    .filter(Boolean);
}

function setParticipants(names) {
  participantsInput.value = names.join("\n");
  syncParticipants();
}

function syncParticipants() {
  participantCount.textContent = getParticipants().length;
  drawWheel();
  saveConfig();
}

function renderPrizes() {
  prizeCount.textContent = prizes.length;
  prizeList.innerHTML = "";
  activePrizeSelect.innerHTML = "";

  prizes.forEach((prize) => {
    const option = document.createElement("option");
    option.value = prize.id;
    option.textContent = prize.name;
    activePrizeSelect.append(option);

    const item = document.createElement("div");
    item.className = "prize-item";
    item.innerHTML = `
      <img src="${prize.image}" alt="">
      <strong></strong>
      <button class="remove-prize" type="button" aria-label="Eliminar premio">x</button>
    `;
    item.querySelector("strong").textContent = prize.name;
    item.querySelector("img").alt = `Foto de ${prize.name}`;
    item.querySelector("button").addEventListener("click", () => {
      prizes = prizes.filter((current) => current.id !== prize.id);
      if (!prizes.length) {
        prizes = [...defaultPrizes.slice(0, 1)];
      }
      renderPrizes();
    });
    prizeList.append(item);
  });

  if (pendingActivePrizeId && prizes.some((prize) => prize.id === pendingActivePrizeId)) {
    activePrizeSelect.value = pendingActivePrizeId;
  }
  pendingActivePrizeId = null;

  syncActivePrize();
  saveConfig();
}

function getActivePrize() {
  return prizes.find((prize) => prize.id === activePrizeSelect.value) || prizes[0];
}

function syncActivePrize() {
  const prize = getActivePrize();
  if (!prize) return;

  activePrizeImage.src = prize.image;
  heroPrizeImage.src = prize.image;
  activePrizeName.textContent = prize.name;
  heroPrizeName.textContent = prize.name;
  saveConfig();
}

function getAudioContext() {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return null;

  if (!audioContext) {
    audioContext = new AudioContext();
  }

  if (audioContext.state === "suspended") {
    audioContext.resume();
  }

  return audioContext;
}

function playWheelTick(context, speed = 1, maxDuration = 0.11) {
  const now = context.currentTime;
  const primary = context.createOscillator();
  const overtone = context.createOscillator();
  const body = context.createOscillator();
  const primaryGain = context.createGain();
  const overtoneGain = context.createGain();
  const bodyGain = context.createGain();
  const masterGain = context.createGain();
  const duration = Math.max(0.035, Math.min(0.11, maxDuration));
  const primaryEnd = now + duration;
  const overtoneEnd = now + duration * 0.88;
  const bodyEnd = now + duration;

  const baseFrequency = 980 + speed * 360;
  const fifthFrequency = baseFrequency * 1.5;

  primary.type = "triangle";
  primary.frequency.setValueAtTime(baseFrequency, now);
  primary.frequency.exponentialRampToValueAtTime(baseFrequency * 0.72, primaryEnd);

  overtone.type = "sine";
  overtone.frequency.setValueAtTime(fifthFrequency, now);
  overtone.frequency.exponentialRampToValueAtTime(fifthFrequency * 0.8, overtoneEnd);

  body.type = "sine";
  body.frequency.setValueAtTime(220 + speed * 70, now);

  primaryGain.gain.setValueAtTime(0.0001, now);
  primaryGain.gain.exponentialRampToValueAtTime(0.18, now + 0.004);
  primaryGain.gain.exponentialRampToValueAtTime(0.0001, primaryEnd);

  overtoneGain.gain.setValueAtTime(0.0001, now);
  overtoneGain.gain.exponentialRampToValueAtTime(0.07, now + 0.005);
  overtoneGain.gain.exponentialRampToValueAtTime(0.0001, overtoneEnd);

  bodyGain.gain.setValueAtTime(0.0001, now);
  bodyGain.gain.exponentialRampToValueAtTime(0.035, now + 0.006);
  bodyGain.gain.exponentialRampToValueAtTime(0.0001, bodyEnd);

  masterGain.gain.value = 1.2;

  primary.connect(primaryGain);
  overtone.connect(overtoneGain);
  body.connect(bodyGain);
  primaryGain.connect(masterGain);
  overtoneGain.connect(masterGain);
  bodyGain.connect(masterGain);
  masterGain.connect(context.destination);

  primary.start(now);
  overtone.start(now);
  body.start(now);
  primary.stop(primaryEnd);
  overtone.stop(overtoneEnd);
  body.stop(bodyEnd);

  const nodes = [primary, overtone, body, primaryGain, overtoneGain, bodyGain, masterGain];
  const stop = () => {
    nodes.forEach((node) => {
      try {
        node.stop?.(0);
      } catch {
        // The oscillator may have already stopped naturally.
      }
      try {
        node.disconnect();
      } catch {
        // Disconnection is best-effort for nodes that already ended.
      }
    });
    activeSoundStops.delete(stop);
  };

  activeSoundStops.add(stop);
  window.setTimeout(stop, duration * 1000 + 40);
}

function startSpinSound() {
  const context = getAudioContext();
  if (!context) return;

  const startedAt = performance.now();
  spinSoundEndsAt = startedAt + spinDuration;
  const tick = () => {
    const elapsed = performance.now() - startedAt;
    const progress = Math.min(elapsed / spinDuration, 1);
    const remaining = spinSoundEndsAt - performance.now();
    if (remaining <= 45) return;

    const speed = 1 - Math.pow(progress, 1.7);
    const maxDuration = Math.max(0.035, Math.min(0.105, remaining / 1000 - 0.012));

    playWheelTick(context, speed, maxDuration);

    if (progress >= 1) return;
    const nextDelay = 36 + Math.pow(progress, 1.45) * 210;
    if (performance.now() + nextDelay < spinSoundEndsAt - 45) {
      spinSoundTimer = window.setTimeout(tick, nextDelay);
    }
  };

  tick();
}

function stopSpinSound() {
  if (spinSoundTimer) {
    window.clearTimeout(spinSoundTimer);
    spinSoundTimer = null;
  }
  activeSoundStops.forEach((stop) => stop());
  activeSoundStops.clear();
}

function fitRadialLabel(text, fontSize, maxWidth) {
  let size = fontSize;
  ctx.font = `900 ${size}px Inter, sans-serif`;

  while (size > 12 && ctx.measureText(text).width > maxWidth) {
    size -= 1;
    ctx.font = `900 ${size}px Inter, sans-serif`;
  }

  if (ctx.measureText(text).width <= maxWidth) {
    return { label: text, fontSize: size };
  }

  let fitted = text;
  while (fitted.length > 3 && ctx.measureText(`${fitted}...`).width > maxWidth) {
    fitted = fitted.slice(0, -1);
  }

  return { label: fitted.length > 3 ? `${fitted}...` : fitted, fontSize: size };
}

function drawRadialLabel(text, midAngle, radius, innerRadius, fontSize) {
  const normalizedAngle = (midAngle + Math.PI * 2) % (Math.PI * 2);
  const isLeftSide = normalizedAngle > Math.PI / 2 && normalizedAngle < Math.PI * 1.5;
  const maxWidth = radius - innerRadius - 42;
  const fitted = fitRadialLabel(text, fontSize, maxWidth);
  const centerOffset = innerRadius + maxWidth / 2;

  ctx.save();
  ctx.rotate(midAngle);
  if (isLeftSide) {
    ctx.rotate(Math.PI);
  }

  ctx.fillStyle = "#ffffff";
  ctx.strokeStyle = "rgba(4, 47, 46, 0.45)";
  ctx.lineWidth = Math.max(3, fitted.fontSize * 0.18);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `900 ${fitted.fontSize}px Inter, sans-serif`;

  const x = isLeftSide ? -centerOffset : centerOffset;
  ctx.strokeText(fitted.label, x, 0);
  ctx.fillText(fitted.label, x, 0);

  ctx.restore();
}

function drawWheel() {
  const names = getParticipants();
  const width = wheelCanvas.width;
  const height = wheelCanvas.height;
  const radius = width / 2 - 32;
  const center = width / 2;
  const labelInnerRadius = 92;
  const fontSize = Math.max(14, Math.min(23, 320 / Math.max(names.length, 1)));

  ctx.clearRect(0, 0, width, height);
  ctx.save();
  ctx.translate(center, height / 2);
  ctx.rotate(rotation);

  if (!names.length) {
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fillStyle = "#eef2f8";
    ctx.fill();
    ctx.fillStyle = "#657083";
    ctx.font = "700 28px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Agrega participantes", 0, 8);
    ctx.restore();
    return;
  }

  const slice = (Math.PI * 2) / names.length;
  names.forEach((name, index) => {
    const start = index * slice;
    const end = start + slice;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, radius, start, end);
    ctx.closePath();
    ctx.fillStyle = colors[index % colors.length];
    ctx.fill();

    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 5;
    ctx.stroke();

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, radius - 12, start + 0.01, end - 0.01);
    ctx.closePath();
    ctx.clip();
    drawRadialLabel(name, start + slice / 2, radius, labelInnerRadius, fontSize);
    ctx.restore();
  });

  ctx.beginPath();
  ctx.arc(0, 0, radius + 8, 0, Math.PI * 2);
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 16;
  ctx.stroke();

  ctx.restore();
}

function pickWinnerIndex(names, finalRotation) {
  const slice = (Math.PI * 2) / names.length;
  const pointerAngle = 0;
  const normalized = (pointerAngle - finalRotation + Math.PI * 2) % (Math.PI * 2);
  return Math.floor(normalized / slice) % names.length;
}

function spinWheel() {
  const names = getParticipants();
  const prize = getActivePrize();
  if (isSpinning || names.length < 2 || !prize) return;

  isSpinning = true;
  spinButton.disabled = true;
  spinButton.textContent = "Girando...";
  startSpinSound();

  const startRotation = rotation;
  const winnerIndex = Math.floor(Math.random() * names.length);
  const slice = (Math.PI * 2) / names.length;
  const winnerCenter = winnerIndex * slice + slice / 2;
  const turns = 10 + Math.random() * 2;
  const targetRotation = turns * Math.PI * 2 - winnerCenter;
  const duration = spinDuration;
  const start = performance.now();

  function animate(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 4);
    rotation = startRotation + (targetRotation - startRotation) * eased;
    drawWheel();

    if (progress < 1) {
      requestAnimationFrame(animate);
      return;
    }

    rotation = targetRotation % (Math.PI * 2);
    drawWheel();
    stopSpinSound();
    const finalIndex = pickWinnerIndex(names, rotation);
    showWinner(names[finalIndex], prize);
    isSpinning = false;
    spinButton.disabled = false;
    spinButton.textContent = "Comenzar";
  }

  requestAnimationFrame(animate);
}

function showWinner(name, prize) {
  winnerTitle.textContent = name;
  winnerPrizeName.textContent = prize.name;
  winnerPrizeImage.src = prize.image;
  winnerPrizeImage.alt = `Foto de ${prize.name}`;
  winnerDialog.showModal();
  launchConfetti();
}

function launchConfetti() {
  const colors = ["#00953B", "#22c55e", "#84cc16", "#facc15", "#ffffff"];
  const container = document.createElement("div");
  container.className = "confetti";
  container.setAttribute("aria-hidden", "true");

  for (let index = 0; index < 42; index += 1) {
    const piece = document.createElement("span");
    const x = 18 + Math.random() * 64;
    const delay = Math.random() * 0.22;
    const duration = 1.4 + Math.random() * 0.8;
    const drift = `${(Math.random() - 0.5) * 220}px`;

    piece.style.left = `${x}%`;
    piece.style.background = colors[index % colors.length];
    piece.style.animationDelay = `${delay}s`;
    piece.style.animationDuration = `${duration}s`;
    piece.style.setProperty("--drift", drift);
    container.append(piece);
  }

  document.body.append(container);
  window.setTimeout(() => container.remove(), 2600);
}

function getConfigPayload() {
  return {
    participants: participantsInput.value,
    prizes,
    activePrizeId: activePrizeSelect.value,
  };
}

function getDefaultPrizeImageIndex(image) {
  return defaultPrizes.findIndex((prize) => prize.image === image);
}

async function getCompactImageReference(image) {
  const defaultImageIndex = getDefaultPrizeImageIndex(image);
  if (defaultImageIndex >= 0) return defaultImageIndex;

  if (image.startsWith("data:image/") && !image.startsWith("data:image/svg") && !image.startsWith("data:image/gif")) {
    try {
      return await resizeImageDataUrl(image);
    } catch {
      return image;
    }
  }

  return image;
}

async function getSharePayload() {
  const activeIndex = Math.max(
    0,
    prizes.findIndex((prize) => prize.id === activePrizeSelect.value),
  );

  return {
    v: 2,
    p: participantsInput.value,
    a: activeIndex,
    r: await Promise.all(
      prizes.map(async (prize) => [prize.name, await getCompactImageReference(prize.image)]),
    ),
  };
}

function applyConfigPayload(payload) {
  if (payload.v === 2) {
    participantsInput.value = payload.p || sampleParticipants.join("\n");
    prizes = Array.isArray(payload.r) && payload.r.length
      ? payload.r.map(([name, imageReference], index) => {
          const defaultPrize = Number.isInteger(imageReference) ? defaultPrizes[imageReference] : null;
          return {
            id: `share-${index}`,
            name: name || `Premio ${index + 1}`,
            image: defaultPrize ? defaultPrize.image : imageReference,
          };
        })
      : [...defaultPrizes];
    pendingActivePrizeId = prizes[payload.a]?.id || prizes[0]?.id || null;
    return;
  }

  participantsInput.value = payload.participants || sampleParticipants.join("\n");
  prizes = Array.isArray(payload.prizes) && payload.prizes.length ? payload.prizes : [...defaultPrizes];
  pendingActivePrizeId = payload.activePrizeId || null;
}

function bytesToBase64Url(bytes) {
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlToBytes(value) {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
  const binary = atob(padded);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

async function encodeShareConfig(payload) {
  const json = JSON.stringify(payload);
  const textBytes = new TextEncoder().encode(json);

  if ("CompressionStream" in window) {
    const stream = new Blob([textBytes]).stream().pipeThrough(new CompressionStream("gzip"));
    const compressed = new Uint8Array(await new Response(stream).arrayBuffer());
    return `gz.${bytesToBase64Url(compressed)}`;
  }

  return `json.${bytesToBase64Url(textBytes)}`;
}

async function decodeShareConfig(value) {
  const separatorIndex = value.indexOf(".");
  const format = value.slice(0, separatorIndex);
  const encoded = value.slice(separatorIndex + 1);
  const bytes = base64UrlToBytes(encoded || "");

  if (format === "gz" && "DecompressionStream" in window) {
    const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream("gzip"));
    const decompressed = await new Response(stream).arrayBuffer();
    return JSON.parse(new TextDecoder().decode(decompressed));
  }

  if (format === "json") {
    return JSON.parse(new TextDecoder().decode(bytes));
  }

  throw new Error("Formato de configuracion no soportado");
}

function getSharedConfigValue() {
  const hash = window.location.hash.startsWith("#") ? window.location.hash.slice(1) : "";
  const params = new URLSearchParams(hash);
  return params.get("c") || params.get("config");
}

async function loadSharedConfig() {
  const sharedConfig = getSharedConfigValue();
  if (!sharedConfig) return false;

  const payload = await decodeShareConfig(sharedConfig);
  applyConfigPayload(payload);

  const cleanUrl = new URL(window.location.href);
  cleanUrl.hash = "";
  window.history.replaceState(null, "", cleanUrl);
  return true;
}

async function createShareLink() {
  const encoded = await encodeShareConfig(await getSharePayload());
  const url = new URL(publicAppUrl);
  url.hash = `c=${encoded}`;
  return url.toString();
}

async function shareCurrentConfig() {
  shareButton.disabled = true;
  shareButton.textContent = "Generando...";
  shareStatus.textContent = "";

  try {
    const link = await createShareLink();
    shareLink.value = link;
    shareOutput.hidden = false;

    try {
      await navigator.clipboard.writeText(link);
      shareStatus.textContent = "Link corto copiado. Puedes enviarlo para abrir esta rifa con la configuracion actual.";
    } catch {
      shareStatus.textContent = "Link corto listo. Seleccionalo para copiarlo.";
    }

    shareLink.focus();
    shareLink.select();
  } catch {
    shareOutput.hidden = false;
    shareStatus.textContent = "No se pudo generar el link. Prueba con imagenes mas livianas.";
  } finally {
    shareButton.disabled = false;
    shareButton.textContent = "Compartir";
  }
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => resolve(reader.result));
    reader.addEventListener("error", reject);
    reader.readAsDataURL(file);
  });
}

function resizeImageDataUrl(dataUrl, maxSize = 520, quality = 0.68) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => {
      const scale = Math.min(1, maxSize / Math.max(image.naturalWidth, image.naturalHeight));
      const width = Math.max(1, Math.round(image.naturalWidth * scale));
      const height = Math.max(1, Math.round(image.naturalHeight * scale));
      const canvas = document.createElement("canvas");
      const imageContext = canvas.getContext("2d");

      canvas.width = width;
      canvas.height = height;
      imageContext.fillStyle = "#ffffff";
      imageContext.fillRect(0, 0, width, height);
      imageContext.drawImage(image, 0, 0, width, height);
      resolve(canvas.toDataURL("image/jpeg", quality));
    });
    image.addEventListener("error", reject);
    image.src = dataUrl;
  });
}

async function preparePrizeImage(file) {
  const dataUrl = await fileToDataUrl(file);
  if (file.type === "image/svg+xml" || file.type === "image/gif") return dataUrl;

  try {
    return await resizeImageDataUrl(dataUrl);
  } catch {
    return dataUrl;
  }
}

function saveConfig() {
  localStorage.setItem(storageKey, JSON.stringify(getConfigPayload()));
}

function loadSavedConfig() {
  const saved = localStorage.getItem(storageKey);
  if (!saved) {
    participantsInput.value = sampleParticipants.join("\n");
    return;
  }

  try {
    const parsed = JSON.parse(saved);
    applyConfigPayload(parsed);
    if (participantsInput.value === previousSampleParticipants.join("\n")) {
      participantsInput.value = sampleParticipants.join("\n");
    }
  } catch {
    participantsInput.value = sampleParticipants.join("\n");
    prizes = [...defaultPrizes];
  }
}

async function initializeApp() {
  try {
    const loadedSharedConfig = await loadSharedConfig();
    if (!loadedSharedConfig) {
      loadSavedConfig();
    }
  } catch {
    loadSavedConfig();
  }

  renderPrizes();
  syncParticipants();
}

participantsInput.addEventListener("input", syncParticipants);
activePrizeSelect.addEventListener("change", syncActivePrize);
sortParticipantsButton.addEventListener("click", () => {
  setParticipants(getParticipants().sort((a, b) => a.localeCompare(b, "es")));
});
shuffleParticipantsButton.addEventListener("click", () => {
  const names = getParticipants();
  for (let index = names.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [names[index], names[randomIndex]] = [names[randomIndex], names[index]];
  }
  setParticipants(names);
});
clearParticipantsButton.addEventListener("click", () => setParticipants([]));
addPrizeButton.addEventListener("click", async () => {
  const name = prizeNameInput.value.trim();
  const file = prizeImageInput.files[0];
  if (!name || !file) return;

  addPrizeButton.disabled = true;
  addPrizeButton.textContent = "Agregando...";
  try {
    const image = await preparePrizeImage(file);
    const prize = { id: crypto.randomUUID(), name, image };
    prizes = [prize, ...prizes];
    renderPrizes();
    activePrizeSelect.value = prize.id;
    syncActivePrize();
    prizeNameInput.value = "";
    prizeImageInput.value = "";
  } finally {
    addPrizeButton.disabled = false;
    addPrizeButton.textContent = "Agregar premio";
  }
});
spinButton.addEventListener("click", spinWheel);
shareButton.addEventListener("click", shareCurrentConfig);
resetWinnerButton.addEventListener("click", () => {
  rotation = 0;
  drawWheel();
});
closeWinnerButton.addEventListener("click", () => winnerDialog.close());
playAgainButton.addEventListener("click", () => {
  winnerDialog.close();
  spinWheel();
});

initializeApp();
