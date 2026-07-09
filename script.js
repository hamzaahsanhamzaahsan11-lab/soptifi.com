console.log("Spotify Player Started...");

// ===============================
// Your Exact Songs Array
// ===============================
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

let audio = new Audio();
let currentIndex = 0;
let playPromise = null;

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
// Cards aur Icons Update State
// ===============================
function updateUIState(playingIndex, isPlaying) {
    document.querySelectorAll(".song-card").forEach((card, index) => {
        const cardPlayBtn = card.querySelector(".play-icon");
        if (!cardPlayBtn) return;

        if (index === playingIndex && isPlaying) {
            cardPlayBtn.classList.add("playing");
            cardPlayBtn.innerHTML = "❚❚";
        } else {
            cardPlayBtn.classList.remove("playing");
            cardPlayBtn.innerHTML = "▶";
        }
    });
}

// ===============================
// Play Song Function
// ===============================
function playSong(index) {
    if (index < 0 || index >= songs.length) return;

    currentIndex = index;
    audio.src = songs[currentIndex];
    
    playPromise = audio.play();

    if (playPromise !== undefined) {
        playPromise
            .then(() => {
                playBtn.innerHTML = "⏸";
                updateUIState(currentIndex, true);
            })
            .catch(error => {
                console.log("Playback error caught safely:", error.message);
            });
    }

    const cards = document.querySelectorAll(".song-card");
    if (cards[currentIndex]) {
        if (songName) songName.innerText = cards[currentIndex].querySelector("h4").innerText;
        if (artistName) artistName.innerText = cards[currentIndex].querySelector("p").innerText || "Unknown Artist";
    }
}

function safePause() {
    if (playPromise !== undefined) {
        playPromise.then(() => {
            audio.pause();
        }).catch(() => {
            audio.pause();
        });
    } else {
        audio.pause();
    }
}

// ===============================
// Build Song Cards in HTML
// ===============================
function init() {
    if (!container) {
        console.error("Error: .cardContainer element nahi mila HTML mein!");
        return;
    }
    
    container.innerHTML = "";

    songs.forEach((song, index) => {
        // Filename nikalne ke liye
        let fileName = decodeURIComponent(song.split("/").pop()).replace(".mp3", "");
        
        container.innerHTML += `
            <div class="song-card" data-index="${index}" style="cursor: pointer;">
                <div class="img-container">
                    <img src="logo.svg" alt="cover" onerror="this.src='logo.svg'">
                    <span class="play-icon">▶</span>
                </div>
                <h4>${fileName}</h4>
                <p>Unknown Artist</p>
            </div>
        `;
    });

    // Event Listeners for Cards click
    document.querySelectorAll(".song-card").forEach((card) => {
        card.addEventListener("click", () => {
            const index = parseInt(card.dataset.index);
            if (currentIndex === index && !audio.paused) {
                safePause();
            } else {
                playSong(index);
            }
        });
    });
}

// Run Program
init();

// ===============================
// Main Control Bar Events
// ===============================
if (playBtn) {
    playBtn.addEventListener("click", () => {
        if (!audio.src && songs.length > 0) {
            playSong(0);
            return;
        }
        if (audio.paused) {
            playSong(currentIndex);
        } else {
            safePause();
        }
    });
}

if (nextBtn) {
    nextBtn.addEventListener("click", () => {
        if (songs.length === 0) return;
        currentIndex = (currentIndex + 1) % songs.length;
        playSong(currentIndex);
    });
}

if (prevBtn) {
    prevBtn.addEventListener("click", () => {
        if (songs.length === 0) return;
        currentIndex = (currentIndex - 1 + songs.length) % songs.length;
        playSong(currentIndex);
    });
}

// Audio Track Adjustments
audio.addEventListener("timeupdate", () => {
    if (songTime) songTime.innerHTML = formatTime(audio.currentTime) + " / " + formatTime(audio.duration);
});

audio.addEventListener("play", () => {
    if (playBtn) playBtn.innerHTML = "⏸";
    if (playbar) playbar.classList.add("playing");
    updateUIState(currentIndex, true);
});

audio.addEventListener("pause", () => {
    if (playBtn) playBtn.innerHTML = "▶";
    if (playbar) playbar.classList.remove("playing");
    updateUIState(currentIndex, false);
});

audio.addEventListener("ended", () => {
    if (playbar) playbar.classList.remove("playing");
    updateUIState(currentIndex, false);
    if (nextBtn) nextBtn.click();
});
