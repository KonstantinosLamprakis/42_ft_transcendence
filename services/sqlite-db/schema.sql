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