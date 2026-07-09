console.log("Spotify Player Started...");

// =========================================================================
// Configuration: Automatically fetches files from your public repository
// =========================================================================
const GITHUB_USERNAME = "hamzaahsanhamzaahsan11-lab";
const REPO_NAME = "soptifi.com";
const API_URL = `https://api.github.com/repos/${GITHUB_USERNAME}/${REPO_NAME}/contents/songs`;

let songs = [];
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
// Automatically Fetch & Sort Songs via GitHub API
// ===============================
async function getSongs() {
    try {
        let response = await fetch(API_URL);
        if (!response.ok) throw new Error("Could not fetch repository contents");
        
        let files = await response.json();
        let mp3Files = [];

        // Loop through everything in the songs folder
        files.forEach(file => {
            if (file.name.endsWith(".mp3")) {
                mp3Files.push(file.download_url);
            }
        });

        // ⚠️ FIX: Sort songs numerically (song1, song2, song3... order mein rahein)
        mp3Files.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
        
        songs = mp3Files;
        return songs;
    } catch (error) {
        console.error("GitHub API Error: ", error);
        return [];
    }
}

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
// Synchronize UI Elements
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
// Play Song Safely
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
                console.log("Playback standard catch-wrap:", error.message);
            });
    }

    const cards = document.querySelectorAll(".song-card");
    if (cards[currentIndex]) {
        songName.innerText = cards[currentIndex].querySelector("h4").innerText;
        artistName.innerText = cards[currentIndex].querySelector("p").innerText || "Unknown Artist";
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
// Build HTML UI Cards & Main Start
// ===============================
async function main() {
    await getSongs();

    if (!container) return;
    container.innerHTML = "";

    if (songs.length === 0) {
        container.innerHTML = "<p style='color: white; padding: 20px;'>No .mp3 songs found in your repository's 'songs' folder!</p>";
        return;
    }

    // Build the list elements
    songs.forEach((song, index) => {
        let fileName = decodeURIComponent(song.split("/").pop().split("?")[0]).replace(".mp3", "");
        
        // ⚠️ FIX: Agar cover.jpg nahi hai toh logo.svg show hogi fallback ke taur par
        container.innerHTML += `
            <div class="song-card" data-index="${index}">
                <div class="img-container">
                    <img src="logo.svg" alt="cover" onerror="this.src='logo.svg'">
                    <span class="play-icon">▶</span>
                </div>
                <h4>${fileName}</h4>
                <p>Unknown Artist</p>
            </div>
        `;
    });

    // Event listener mapping
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

// Initialize System
main();

// ===============================
// Control Layout Triggers
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

nextBtn.addEventListener("click", () => {
    if (songs.length === 0) return;
    currentIndex = (currentIndex + 1) % songs.length;
    playSong(currentIndex);
});

prevBtn.addEventListener("click", () => {
    if (songs.length === 0) return;
    currentIndex = (currentIndex - 1 + songs.length) % songs.length;
    playSong(currentIndex);
});

audio.addEventListener("timeupdate", () => {
    songTime.innerHTML = formatTime(audio.currentTime) + " / " + formatTime(audio.duration);
});

audio.addEventListener("play", () => {
    playBtn.innerHTML = "⏸";
    if (playbar) playbar.classList.add("playing");
    updateUIState(currentIndex, true);
});

audio.addEventListener("pause", () => {
    playBtn.innerHTML = "▶";
    if (playbar) playbar.classList.remove("playing");
    updateUIState(currentIndex, false);
});

audio.addEventListener("ended", () => {
    if (playbar) playbar.classList.remove("playing");
    updateUIState(currentIndex, false);
    nextBtn.click();
});
