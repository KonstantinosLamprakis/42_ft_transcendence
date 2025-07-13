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