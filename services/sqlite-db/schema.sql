CREATE TABLE
    IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        nickname TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        avatar TEXT, -- store the filename or URL of the uploaded image
        wins INTEGER DEFAULT 0,
        loses INTEGER DEFAULT 0,
        twofa_secret TEXT,
        is2FaEnabled BOOLEAN DEFAULT 0,
        isGoogleAccount BOOLEAN DEFAULT 0
    );

CREATE TABLE
    IF NOT EXISTS matches (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user1_id INTEGER NOT NULL,
        user2_id INTEGER NOT NULL,
        user1_score INTEGER DEFAULT 0,
        user2_score INTEGER DEFAULT 0,
        winner_id INTEGER,
        match_date TEXT, -- store date as (YYYY-MM-DD) to be human readable 
        FOREIGN KEY(user1_id) REFERENCES users(id),
        FOREIGN KEY(user2_id) REFERENCES users(id),
        FOREIGN KEY(winner_id) REFERENCES users(id)
    );

CREATE TABLE
    IF NOT EXISTS friends (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        friend_id INTEGER NOT NULL,
        FOREIGN KEY(user_id) REFERENCES users(id),
        FOREIGN KEY(friend_id) REFERENCES users(id)
    );