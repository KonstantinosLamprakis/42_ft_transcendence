CREATE TABLE
    IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        avatar TEXT, -- store the filename or URL of the uploaded image
        wins INTEGER DEFAULT 0,
        loses INTEGER DEFAULT 0,
        twofa_secret TEXT,
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
        match_date TEXT,
        FOREIGN KEY(user1_id) REFERENCES users(id),
        FOREIGN KEY(user2_id) REFERENCES users(id),
        FOREIGN KEY(winner_id) REFERENCES users(id)
    );
