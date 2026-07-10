const API_URL = "/songs";

async function loadSongs() {
  try {
    const response = await fetch(API_URL);

    if (!response.ok) {
      const error = await response.json(); 
      showError(error.detail || "曲名の取得に失敗しました");
      return; 
    }

    const songs = await response.json();
    renderSongs(songs); 
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

async function toggleSong(id, currentFavorite) {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "PUT", 
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ favorite: !currentFavorite }), 
    });

    if (!response.ok) {
      const error = await response.json();
      showError(error.detail || "曲の更新に失敗しました");
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
    li.className = "song-item" + (song.favorite ? " done" : "");

    const label = document.createElement("label");
    label.className = "song-label";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "song-checkbox";
    checkbox.checked = song.favorite; 
    checkbox.addEventListener("change", () => toggleSong(song.id, song.favorite));

    const titleSpan = document.createElement("span");
    titleSpan.className = "song-title";
    titleSpan.textContent = `${song.title} - ${song.artist}`;

    label.appendChild(checkbox);
    label.appendChild(titleSpan);

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "delete-button";
    deleteBtn.textContent = "削除";
    deleteBtn.addEventListener("click", () => deleteSong(song.id));

    li.appendChild(label);
    li.appendChild(deleteBtn);

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

loadSongs();
