console.log("Spotify Player Started...");

// ===============================
// Variables
// ===============================
let audio = new Audio();
let currentIndex = 0;

// IMPORTANT: For GitHub Pages, put your MP3 files inside the "songs" folder
// and list their exact filenames here. Localhost fetching won't work on GitHub.
const songs = [
    "songs/song(1).mp3",
    "songs/song(2).mp3",
    "songs/song(3).mp3",
    "songs/song(4).mp3",
    "songs/song(5).mp3",
    "songs/song(6).mp3",
    "songs/song(7).mp3",
    "songs/song(8).mp3",
    "songs/song(9).mp3",
    "songs/song(10).mp3",
    "songs/song(11).mp3",
    "songs/song(12).mp3",
    "songs/song(13).mp3"
];

const playBtn = document.getElementById("playPause");
const nextBtn = document.getElementById("next");
const prevBtn = document.getElementById("previous");
const songName = document.getElementById("songName");
const artistName = document.getElementById("artistName");
const songTime = document.getElementById("songTime");
const playbar = document.querySelector(".playbar");
const container = document.querySelector(".cardContainer");

// ===============================
// Format Time
// ===============================
function formatTime(seconds) {
    if (isNaN(seconds)) return "00:00";
    let min = Math.floor(seconds / 60);
    let sec = Math.floor(seconds % 60);
    return String(min).padStart(2, "0") + ":" + String(sec).padStart(2, "0");
}

// ===============================
// UI Updates for Play/Pause Buttons
// ===============================
function updateCardUI(playingIndex, isPlaying) {
    document.querySelectorAll(".song-card").forEach((card, index) => {
        const playIcon = card.querySelector(".play-icon");
        if (!playIcon) return;

        if (index === playingIndex && isPlaying) {
            playIcon.classList.add("playing");
            playIcon.innerHTML = "❚❚";
        } else {
            playIcon.classList.remove("playing");
            playIcon.innerHTML = "▶";
        }
    });
}

// ===============================
// Play Song
// ===============================
function playSong(index) {
    if (index < 0 || index >= songs.length) return;

    currentIndex = index;
    audio.src = songs[currentIndex];
    audio.play();

    const cards = document.querySelectorAll(".song-card");
    if (cards[currentIndex]) {
        songName.innerText = cards[currentIndex].querySelector("h4").innerText;
        artistName.innerText = cards[currentIndex].querySelector("p").innerText;
    }

    playBtn.innerHTML = "⏸";
    updateCardUI(currentIndex, true);
}

// ===============================
// Build UI and Initialize
// ===============================
function init() {
    if (!container) return;

    // 1. Render UI Cards dynamically from the array
    container.innerHTML = ""; // Clear existing
    songs.forEach((song, index) => {
        let fileName = decodeURIComponent(song.split("/").pop()).replace(".mp3", "");
        
        container.innerHTML += `
            <div class="song-card" data-index="${index}">
                <img src="cover.jpg" alt="cover">
                <h4>${fileName}</h4>
                <p>Unknown Artist</p>
                <span class="play-icon">▶</span>
            </div>
        `;
    });

    // 2. Attach Click Listeners to the newly created cards
    document.querySelectorAll(".song-card").forEach((card) => {
        card.addEventListener("click", () => {
            const index = parseInt(card.dataset.index);
            if (currentIndex === index && !audio.paused) {
                audio.pause();
            } else if (currentIndex === index && audio.paused && audio.src) {
                audio.play();
            } else {
                playSong(index);
            }
        });
    });
}

// Run setup
init();

// ===============================
// Controls: Play / Pause
// ===============================
playBtn.addEventListener("click", () => {
    if (!audio.src && songs.length > 0) {
        playSong(0);
        return;
    }
    if (audio.paused) {
        audio.play();
    } else {
        audio.pause();
    }
});

// ===============================
// Controls: Next
// ===============================
nextBtn.addEventListener("click", () => {
    if (songs.length === 0) return;
    currentIndex = (currentIndex + 1) % songs.length;
    playSong(currentIndex);
});

// ===============================
// Controls: Previous
// ===============================
prevBtn.addEventListener("click", () => {
    if (songs.length === 0) return;
    currentIndex = (currentIndex - 1 + songs.length) % songs.length;
    playSong(currentIndex);
});

// ===============================
// Audio Event Listeners
// ===============================
audio.addEventListener("timeupdate", () => {
    songTime.innerHTML = formatTime(audio.currentTime) + " / " + formatTime(audio.duration);
});

audio.addEventListener("play", () => {
    playBtn.innerHTML = "⏸";
    if (playbar) playbar.classList.add("playing");
    updateCardUI(currentIndex, true);
});

audio.addEventListener("pause", () => {
    playBtn.innerHTML = "▶";
    if (playbar) playbar.classList.remove("playing");
    updateCardUI(currentIndex, false);
});

audio.addEventListener("ended", () => {
    if (playbar) playbar.classList.remove("playing");
    updateCardUI(currentIndex, false);
    // Auto-advance to next song
    nextBtn.click();
});
