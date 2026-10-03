// Die Song-Daten stehen separat in songs.js.

const libraryView = document.getElementById("libraryView");
const playerView = document.getElementById("playerView");
const songLibrary = document.getElementById("songLibrary");
const songTitle = document.getElementById("songTitle");
const backToLibrary = document.getElementById("backToLibrary");
const tracksEl = document.getElementById("tracks");
const playPauseBtn = document.getElementById("playPause");
const stopBtn = document.getElementById("stop");
const resetBtn = document.getElementById("reset");
const masterVolume = document.getElementById("masterVolume");
const masterValue = document.getElementById("masterValue");
const tempo = document.getElementById("tempo");
const tempoValue = document.getElementById("tempoValue");
const rewindBtn = document.getElementById("rewind");
const forwardBtn = document.getElementById("forward");
const progress = document.getElementById("progress");
const timeDisplay = document.getElementById("timeDisplay");
const sheetImage = document.getElementById("sheetImage");
const sheetSection = document.getElementById("sheetSection");

let activeSong = null;
let tracks = [];
let isPlaying = false;
let progressFrame = null;

function renderLibrary() {
  songLibrary.innerHTML = "";

  songs.forEach((song, index) => {
    const card = document.createElement("article");
    card.className = `song-card ${song.placeholder ? "placeholder" : "available"}`;

    card.innerHTML = `
      <div>
        <p class="song-number">STÜCK ${index + 1}</p>
        <h2>${song.title}</h2>
        <p>${song.composer}</p>
      </div>
      ${song.placeholder ? "" : '<button class="open-song" type="button">▶ Stück öffnen</button>'}
    `;

    if (!song.placeholder) {
      card.addEventListener("click", () => openSong(song));
    }

    songLibrary.appendChild(card);
  });
}

function destroyTracks() {
  if (progressFrame) cancelAnimationFrame(progressFrame);
  progressFrame = null;

  tracks.forEach(t => {
    t.audio.pause();
    t.audio.src = "";
  });

  tracks = [];
  tracksEl.innerHTML = "";
  isPlaying = false;
}

function openSong(song) {
  destroyTracks();

  activeSong = song;
  libraryView.hidden = true;
  playerView.hidden = false;

  songTitle.innerHTML =
    `${song.title} <span class="composer">– ${song.composer}</span>`;

  progress.value = 0;
  timeDisplay.textContent = "0:00 / 0:00";

  masterVolume.value = 80;
  tempo.value = 100;

  createTracks(song.tracks || []);

  if (song.sheets?.length) {
    sheetSection.hidden = false;
    sheetImage.src = song.sheets[0].file;
  } else {
    sheetSection.hidden = true;
  }

  updateVolumes();

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

function createTracks(configs) {
  configs.forEach((config, index) => {
    const audio = new Audio(config.file);
    audio.preload = "auto";

    const card = document.createElement("article");
    card.className = "track";

    card.innerHTML = `
      <h2>${config.name}</h2>

      <div class="volume-wrap">
        <label for="vol-${index}">Lautstärke</label>
        <input
          id="vol-${index}"
          type="range"
          min="0"
          max="100"
          value="${config.defaultVolume}"
        >
        <span id="val-${index}">${config.defaultVolume}%</span>
      </div>

      <button
        type="button"
        class="solo"
        aria-label="${config.name} solo hören"
      >S</button>

      <button
        type="button"
        class="mute"
        aria-label="${config.name} stumm schalten"
      >M</button>
    `;

    tracksEl.appendChild(card);

    const track = {
      config,
      audio,
      volume: card.querySelector(`#vol-${index}`),
      value: card.querySelector(`#val-${index}`),
      solo: card.querySelector(".solo"),
      mute: card.querySelector(".mute"),
      isSolo: false,
      isMuted: false
    };

    tracks.push(track);

    track.volume.addEventListener("input", () => {
      track.value.textContent = `${track.volume.value}%`;
      updateVolumes();
    });

    track.solo.addEventListener("click", () => {
      track.isSolo = !track.isSolo;
      track.solo.classList.toggle("active", track.isSolo);
      updateVolumes();
    });

    track.mute.addEventListener("click", () => {
      track.isMuted = !track.isMuted;
      track.mute.classList.toggle("active", track.isMuted);
      updateVolumes();
    });

    audio.addEventListener("loadedmetadata", updateProgress);

    if (index === 0) {
      audio.addEventListener("ended", stopAll);
    }
  });
}

function updateVolumes() {
  const master = Number(masterVolume.value) / 100;
  const hasSolo = tracks.some(t => t.isSolo);

  tracks.forEach(t => {
    let ownVolume =
      Number(t.volume.value) / 100 * (t.config.boost || 1);

    ownVolume = Math.min(ownVolume, 1);

    t.audio.volume =
      t.isMuted || (hasSolo && !t.isSolo)
        ? 0
        : ownVolume * master;

    t.audio.playbackRate =
      Number(tempo.value) / 100;
  });

  masterValue.textContent = `${masterVolume.value}%`;
  tempoValue.textContent = `${tempo.value}%`;
}

function syncToFirstTrack() {
  const current =
    tracks[0]?.audio.currentTime || 0;

  tracks.forEach(t => {
    t.audio.currentTime = current;
  });
}

async function playAll() {
  if (!tracks.length) return;

  syncToFirstTrack();

  try {
    await Promise.all(
      tracks.map(t => t.audio.play())
    );

    isPlaying = true;
    playPauseBtn.textContent = "⏸ Pause";
    updateProgress();

  } catch {
    alert(
      "Die Audiodateien konnten nicht abgespielt werden. Bitte prüfe die Dateien im Audio-Ordner."
    );
  }
}

function pauseAll() {
  tracks.forEach(t => t.audio.pause());

  isPlaying = false;
  playPauseBtn.textContent = "▶ Abspielen";
}

function stopAll() {
  pauseAll();

  tracks.forEach(t => {
    t.audio.currentTime = 0;
  });

  progress.value = 0;

  updateSheetMusic(0);
  updateProgress();
}

function resetAll() {
  stopAll();

  masterVolume.value = 80;
  tempo.value = 100;

  tracks.forEach(t => {
    t.volume.value = t.config.defaultVolume;
    t.value.textContent =
      `${t.config.defaultVolume}%`;

    t.isSolo = false;
    t.isMuted = false;

    t.solo.classList.remove("active");
    t.mute.classList.remove("active");
  });

  updateVolumes();
}

function updateSheetMusic(currentTime) {
  if (!activeSong?.sheets?.length) return;

  let page = activeSong.sheets[0];

  activeSong.sheets.forEach(sheet => {
    if (currentTime >= sheet.from) {
      page = sheet;
    }
  });

  if (!sheetImage.src.endsWith(page.file)) {
    sheetImage.src = page.file;
  }
}

function formatTime(seconds) {
  if (!seconds || isNaN(seconds)) {
    return "0:00";
  }

  const min = Math.floor(seconds / 60);

  const sec = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");

  return `${min}:${sec}`;
}

function updateProgress() {
  if (!tracks.length) return;

  const first = tracks[0].audio;

  const current = first.currentTime;
  const duration = first.duration || 0;

  updateSheetMusic(current);

  if (duration > 0) {
    progress.value =
      (current / duration) * 100;

    timeDisplay.textContent =
      `${formatTime(current)} / ${formatTime(duration)}`;
  }

  if (isPlaying) {
    progressFrame =
      requestAnimationFrame(updateProgress);
  }
}

playPauseBtn.addEventListener(
  "click",
  () => isPlaying ? pauseAll() : playAll()
);

stopBtn.addEventListener(
  "click",
  stopAll
);

resetBtn.addEventListener(
  "click",
  resetAll
);

masterVolume.addEventListener(
  "input",
  updateVolumes
);

tempo.addEventListener(
  "input",
  updateVolumes
);

progress.addEventListener(
  "input",
  () => {
    if (!tracks.length) return;

    const duration =
      tracks[0].audio.duration || 0;

    const newTime =
      Number(progress.value) / 100 * duration;

    tracks.forEach(t => {
      t.audio.currentTime = newTime;
    });

    updateSheetMusic(newTime);
  }
);

rewindBtn.addEventListener(
  "click",
  () => {
    tracks.forEach(t => {
      t.audio.currentTime =
        Math.max(0, t.audio.currentTime - 10);
    });

    updateProgress();
  }
);

forwardBtn.addEventListener(
  "click",
  () => {
    tracks.forEach(t => {
      t.audio.currentTime =
        Math.min(
          t.audio.duration || 0,
          t.audio.currentTime + 10
        );
    });

    updateProgress();
  }
);

backToLibrary.addEventListener(
  "click",
  () => {
    destroyTracks();

    activeSong = null;

    playerView.hidden = true;
    libraryView.hidden = false;

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }
);

renderLibrary();
