const API_URL = "/songs";
let currentSongs=[];
let currentSort="new";
let showFavoritesOnly = false;

const songArea = document.querySelector(".list-card");
const aboutArea = document.getElementById("about-section");

async function loadSongs() {
  try {
    const response = await fetch(API_URL);

    if (!response.ok) {
      const error = await response.json(); 
      showError(error.detail || "曲名の取得に失敗しました");
      return; 
    }

    const songs = await response.json();

    console.log(songs);

    currentSongs = songs;
    sortSongs(); 

  } catch (error) {
    showError("通信エラーが発生しました");
  }
}

async function addSong() {
  const titleInput = document.getElementById("song-input");
  const artistInput = document.getElementById("artist-input");
  const title = titleInput.value.trim();
  const artist = artistInput.value.trim();

  if (title === "") {
    showError("曲名を入力してください");
    return;
  }

  if (artist === "") {
    showError("アーティスト名を入力してください")
    return;
  }

  if (title.length > 100) {
    showError("タイトルは100文字以内で入力してください");
    return;
  }

  try {
    const response = await fetch(API_URL, {
      method: "POST", 
      headers: { "Content-Type": "application/json" }, 
      body: JSON.stringify({ title: title, artist: artist }), 
    });

    if (!response.ok) {
      const error = await response.json();
      showError(error.detail || "曲名の追加に失敗しました");
      return;
    }

    titleInput.value = ""; 
    artistInput.value = "";
    await loadSongs(); 
  } catch (error) {
    showError("通信エラーが発生しました");
  }
}
async function toggleFavorite(id, currentFavorite) {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        favorite: !currentFavorite
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      showError(error.detail || "お気に入り変更に失敗しました");
      return;
    }

    await loadSongs();

  } catch (error) {
    showError("通信エラーが発生しました");
  }
}

async function deleteSong(id) {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "DELETE", 
    });

    if (!response.ok) {
      const error = await response.json();
      showError(error.detail || "曲の削除に失敗しました");
      return;
    }

    await loadSongs(); 
  } catch (error) {
    showError("通信エラーが発生しました");
  }
}

function renderSongs(songs) {
  const list = document.getElementById("song-list");
  list.innerHTML = ""; 

  songs.forEach((song) => {
    const li = document.createElement("li");
    li.className = "song-item";

    const label = document.createElement("div");
    label.className = "song-label";

    const titleSpan = document.createElement("span");
    titleSpan.className = "song-title";
    titleSpan.textContent = `${song.title} - ${song.artist}`;

    label.appendChild(titleSpan);

    const favoriteBtn = document.createElement("button");
    favoriteBtn.className = "favorite-button";
    
    if (song.favorite) {
      favoriteBtn.classList.add("active");
      favoriteBtn.textContent = "★";
    } else {
      favoriteBtn.textContent = "☆";
    }
    
    favoriteBtn.addEventListener("click", () => {
      toggleFavorite(song.id, song.favorite);
    });

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "delete-button";
    deleteBtn.textContent = "削除";
    deleteBtn.addEventListener("click", () => deleteSong(song.id));

    const playBtn = document.createElement("button");
    playBtn.className = "play-button";
    playBtn.textContent = "▶";

    playBtn.addEventListener("click", () => {
      const youtubeUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(song.title + " " + song.artist)}`;
      window.open(youtubeUrl, "_blank");
    });

    const actionArea = document.createElement("div");
    actionArea.className = "song-actions";

    actionArea.appendChild(playBtn);
    actionArea.appendChild(favoriteBtn);
    actionArea.appendChild(deleteBtn);

    li.appendChild(label);
    li.appendChild(actionArea);

    list.appendChild(li);
  });
}

function showError(message) {
  const errorDiv = document.getElementById("error-message");
  errorDiv.textContent = message; 
  errorDiv.style.display = "block"; 
  setTimeout(() => {
    errorDiv.style.display = "none"; 
  }, 5000);
}

document.getElementById("song-form").addEventListener("submit", function (e) {
  e.preventDefault(); 
  addSong(); 
});

const songInput = document.getElementById("song-input");
const artistInput = document.getElementById("artist-input");
songInput.addEventListener("keydown", function(e) {
  if (e.key === "Enter") {
    e.preventDefault(); 
    artistInput.focus(); 
  }
});
artistInput.addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    e.preventDefault();
    addSong();
  }
});

function sortSongs() {
  let sortedSongs = [...currentSongs];

  if (currentSort === "title-jp") {
    sortedSongs.sort((a, b) =>
      a.title.localeCompare(b.title, "ja")
    );
  }

  if (currentSort === "artist") {
    sortedSongs.sort((a, b) =>
      a.artist.localeCompare(b.artist, "ja",{
        sensitivity: "base"
      })
    );
  }

  if (currentSort === "new") {
    sortedSongs.sort((a, b) => a.id - b.id);
  }

  if (showFavoritesOnly) {
  sortedSongs = sortedSongs.filter(song => song.favorite);
}

  renderSongs(sortedSongs);
}

document
  .getElementById("sort-select")
  .addEventListener("change", function () {
    currentSort = this.value;
    sortSongs();
  });

const menuButton = document.querySelector(".menu-button");
const menuList = document.querySelector(".menu-list");

menuButton.addEventListener("click", function() {
  menuList.classList.toggle("active");
});

document.addEventListener("click", function (e) {
  if (
    !menuButton.contains(e.target) &&
    !menuList.contains(e.target)
  ) {
    menuList.classList.remove("active");
  }
});

document.querySelectorAll(".menu-list a").forEach((item) => {
  item.addEventListener("click", () => {
    menuList.classList.remove("active");
  });
});

const favoriteMenu = document.getElementById("favorite-menu");
const homeMenu = document.getElementById("home-menu");
function showSongList() {
  songArea.style.display = "block";
  aboutArea.style.display = "none";
}

favoriteMenu.addEventListener("click", function(e) {
  e.preventDefault();

  showSongList();

  showFavoritesOnly = true;

  searchInput.value = "";

  sortSongs();
});

homeMenu.addEventListener("click", function(e) {
  e.preventDefault();

  showSongList();

  showFavoritesOnly = false;

  searchInput.value = "";

  sortSongs();
});

const aboutMenu = document.getElementById("about-menu");
aboutMenu.addEventListener("click", function(e) {
  e.preventDefault();

  searchInput.value = "";

  songArea.style.display = "none";
  aboutArea.style.display = "block";
});

const searchInput = document.getElementById("search-input");

searchInput.addEventListener("input", function() {
  const keyword = searchInput.value.toLowerCase();

  let filteredSongs = currentSongs.filter(song =>
    song.title.toLowerCase().includes(keyword) ||
    song.artist.toLowerCase().includes(keyword)
  );

  if (showFavoritesOnly) {
    filteredSongs = filteredSongs.filter(song => song.favorite);
  }

  renderSongs(filteredSongs);
});


loadSongs();
