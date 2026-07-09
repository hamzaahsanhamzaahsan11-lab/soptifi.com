console.log("Spotify Player Started...");

// ===============================
// Variables
// ===============================
let audio = new Audio();
let currentIndex = 0;

// IMPORTANT: List your exact filenames inside your GitHub "songs" folder
const songs = [
    "songs/song(1).mp3",
    "songs/song(2).mp3",
    "songs/song(3).mp3"
    "songs/song(4).mp3"
    "songs/song(5).mp3"
    "songs/song(6).mp3"
    "songs/song(7).mp3"
];

const playBtn = document.getElementById("playPause");
const nextBtn = document.getElementById("next");
const prevBtn = document.getElementById("previous");
const songName = document.getElementById("songName");
const artistName = document.getElementById("artistName");
const songTime = document.getElementById("songTime");
const playbar = document.querySelector(".playbar");
const container = document.querySelector(".cardContainer");

// Track the current play promise to prevent unhandled interruption errors
let playPromise = null;

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
// Play Song Safely (Handles Promises)
// ===============================
function playSong(index) {
    if (index < 0 || index >= songs.length) return;

    currentIndex = index;
    audio.src = songs[currentIndex];
    
    // Catch the promise to handle rapid-click interruptions gracefully
    playPromise = audio.play();

    if (playPromise !== undefined) {
        playPromise
            .then(() => {
                // Playback successfully started
                playBtn.innerHTML = "⏸";
                updateCardUI(currentIndex, true);
            })
            .catch(error => {
                // Interruption or autoplay blocking handled safely here
                console.log("Playback request wrapped safely: ", error.message);
            });
    }

    const cards = document.querySelectorAll(".song-card");
    if (cards[currentIndex]) {
        songName.innerText = cards[currentIndex].querySelector("h4").innerText;
        artistName.innerText = cards[currentIndex].querySelector("p").innerText;
    }
}

// ===============================
// Build UI and Initialize
// ===============================
function init() {
    if (!container) return;

    container.innerHTML = ""; 
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

    document.querySelectorAll(".song-card").forEach((card) => {
        card.addEventListener("click", () => {
            const index = parseInt(card.dataset.index);
            if (currentIndex === index && !audio.paused) {
                safePause();
            } else if (currentIndex === index && audio.paused && audio.src) {
                playSong(index);
            } else {
                playSong(index);
            }
        });
    });
}

// Helper function to pause only after the audio has finished its initial load promise
function safePause() {
    if (playPromise !== undefined) {
        playPromise.then(() => {
            audio.pause();
        }).catch(() => {
            // If the play promise failed/interrupted, force a pause safely
            audio.pause();
        });
    } else {
        audio.pause();
    }
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
        playSong(currentIndex);
    } else {
        safePause();
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
    // Auto-advance to next song seamlessly
    nextBtn.click();
});
