console.log("Spotify Player Started...");

// ===============================
// Variables
// ===============================
let songs = [];
let audio = new Audio();
let currentIndex = 0;

const playBtn = document.getElementById("playPause");
const nextBtn = document.getElementById("next");
const prevBtn = document.getElementById("previous");
const songName = document.getElementById("songName");
const artistName = document.getElementById("artistName");
const songTime = document.getElementById("songTime");
const playbar = document.querySelector(".playbar");

// ===============================
// Load Songs
// ===============================
async function getSongs() {

    let response = await fetch("http://127.0.0.1:3000/songs/");
    let text = await response.text();

    let div = document.createElement("div");
    div.innerHTML = text;

    let links = div.getElementsByTagName("a");

    songs = [];

    for (let i = 0; i < links.length; i++) {

        if (links[i].href.endsWith(".mp3")) {
            songs.push(links[i].href);
        }

    }

    return songs;

}

// ===============================
// Format Time
// ===============================
function formatTime(seconds) {

    if (isNaN(seconds))
        return "00:00";

    let min = Math.floor(seconds / 60);
    let sec = Math.floor(seconds % 60);

    return (
        String(min).padStart(2, "0") +
        ":" +
        String(sec).padStart(2, "0")
    );

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

        songName.innerText =
            cards[currentIndex].querySelector("h4").innerText;

        artistName.innerText =
            cards[currentIndex].querySelector("p").innerText;

    }

    playBtn.innerHTML = "⏸";

}

// ===============================
// Main
// ===============================
async function main() {

    await getSongs();

    const cards = document.querySelectorAll(".song-card");

    cards.forEach((card, index) => {

        card.addEventListener("click", () => {

            playSong(index);

        });

    });

}

main();

// ===============================
// Play / Pause
// ===============================
playBtn.addEventListener("click", () => {

    if (!audio.src) return;

    if (audio.paused) {

        audio.play();

    } else {

        audio.pause();

    }

});

// ===============================
// Next
// ===============================
nextBtn.addEventListener("click", () => {

    if (songs.length === 0) return;

    currentIndex++;

    if (currentIndex >= songs.length)
        currentIndex = 0;

    playSong(currentIndex);

});

// ===============================
// Previous
// ===============================
prevBtn.addEventListener("click", () => {

    if (songs.length === 0) return;

    currentIndex--;

    if (currentIndex < 0)
        currentIndex = songs.length - 1;

    playSong(currentIndex);

});

// ===============================
// Update Time
// ===============================
audio.addEventListener("timeupdate", () => {

    songTime.innerHTML =
        formatTime(audio.currentTime) +
        " / " +
        formatTime(audio.duration);

});

// ===============================
// Song End
// ===============================
audio.addEventListener("ended", () => {

    currentIndex++;

    if (currentIndex >= songs.length)
        currentIndex = 0;

    playSong(currentIndex);

});

// ===============================
// Playbar Animation
// ===============================
audio.addEventListener("play", () => {

    playBtn.innerHTML = "⏸";
    playbar.classList.add("playing");

});

audio.addEventListener("pause", () => {

    playBtn.innerHTML = "▶";
    playbar.classList.remove("playing");

});

audio.addEventListener("ended", () => {

    playbar.classList.remove("playing");

});


const container = document.querySelector(".cardContainer");

songs.forEach((song, index) => {

    let fileName = decodeURIComponent(song.split("/").pop())
        .replace(".mp3", "");

    container.innerHTML += `
        <div class="song-card" data-index="${index}">
            <img src="cover.jpg" alt="">
            <h4>${fileName}</h4>
            <p>Unknown Artist</p>
        </div>
    `;

});document.querySelectorAll(".song-card").forEach((card) => {

    card.addEventListener("click", () => {

        playSong(card.dataset.index);

    });

});
const cards = document.querySelectorAll(".song-card");

cards.forEach((card, index) => {

    card.addEventListener("click", () => {

        // Sab buttons reset
        document.querySelectorAll(".play-icon").forEach(btn => {
            btn.classList.remove("playing");
            btn.innerHTML = "▶";
        });

        // Sirf clicked card ka button
        const playBtn = card.querySelector(".play-icon");
        playBtn.classList.add("playing");
        playBtn.innerHTML = "❚❚";

        // Song play
        playSong(index);

    });

});audio.addEventListener("pause", () => {

    document.querySelectorAll(".play-icon").forEach(btn => {
        btn.classList.remove("playing");
        btn.innerHTML = "▶";
    });

});audio.addEventListener("ended", () => {

    document.querySelectorAll(".play-icon").forEach(btn => {
        btn.classList.remove("playing");
        btn.innerHTML = "▶";
    });

});

