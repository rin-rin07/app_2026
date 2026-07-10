import sqlite3  
import uvicorn  

from fastapi import FastAPI, HTTPException  
from fastapi.middleware.cors import CORSMiddleware  
from fastapi.staticfiles import StaticFiles  
from pydantic import BaseModel, Field  

app = FastAPI(title="Doll's Music Box")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATABASE = "songs.db"


def init_db():
    """データベースとテーブルを初期化する"""
    conn = sqlite3.connect(DATABASE)  
    cursor = conn.cursor()  
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS songs (
                   id INTEGER PRIMARY KEY AUTOINCREMENT,
                   title TEXT NOT NULL,      -- 曲名
                   artist TEXT NOT NULL,
                   favorite INTEGER DEFAULT 0 -- お気に入り(0/1)
        );
    """)
    conn.commit()  
    conn.close()  


class SongCreate(BaseModel):
    title: str = Field(min_length=1, max_length=100)
    artist: str = Field(min_length=1, max_length=100)


class SongUpdate(BaseModel):
    favorite: bool


@app.get("/songs")  
def get_songs():
    """song一覧を取得する"""
    conn = sqlite3.connect(DATABASE)  
    cursor = conn.cursor()

    cursor.execute("SELECT id, title, artist, favorite FROM songs ORDER BY id")
    songs = cursor.fetchall()  

    conn.close()  
    return [
        {"id": song[0], "title": song[1], "artist": song[2], "favorite": bool(song[3])}
        for song in songs
    ]


@app.post("/songs", status_code=201) 
def create_song(song: SongCreate):
    """新しいsongを作成する"""
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()

    cursor.execute(
        "INSERT INTO songs (title, artist, favorite) VALUES (?, ?, 0)",
        (song.title, song.artist),
    )
    conn.commit()  
    song_id = cursor.lastrowid  # 

    conn.close()
    return {"id": song_id, "title": song.title, "artist": song.artist, "favorite": False}


@app.put("/songs/{song_id}")
def update_song(song_id: int, song: SongUpdate):
    """お気に入りの状態を更新する"""
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()

    cursor.execute("SELECT title, artist FROM songs WHERE id = ?", (song_id,))
    existing = cursor.fetchone()  
    if existing is None:
        conn.close()  
        raise HTTPException(status_code=404, detail="song not found")

    cursor.execute(
        "UPDATE songs SET favorite = ? WHERE id = ?",
        (int(song.favorite), song_id),
    )
    conn.commit() 

    conn.close()
    return {"id": song_id, "title": existing[0], "artist": existing[1], "favorite": song.favorite}


@app.delete("/songs/{song_id}")  
def delete_song(song_id: int):
    """songを削除する"""
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()

    cursor.execute("SELECT id FROM songs WHERE id = ?", (song_id,))
    existing = cursor.fetchone()
    if existing is None:
        conn.close()
        raise HTTPException(status_code=404, detail="song not found")

    cursor.execute("DELETE FROM songs WHERE id = ?", (song_id,))  
    conn.commit()  

    conn.close()
    return {"message": "Song deleted", "id": song_id}


app.mount("/", StaticFiles(directory="static", html=True), name="static")

init_db()

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
