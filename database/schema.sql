-- database/schema.sql v.1.3
-- Aggiunte colonne di metadati alla tabella meal_plans per lo storico.

CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY NOT NULL,
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS user_preferences (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT UNIQUE NOT NULL,
    calorie_target INTEGER DEFAULT 2000 NOT NULL,
    distribution TEXT NOT NULL,
    dietary_preference TEXT DEFAULT 'NONE' NOT NULL,
    difficulty_level TEXT DEFAULT 'ANY' NOT NULL,
    disliked_ingredients TEXT DEFAULT '[]' NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS allergens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS user_preferences_allergens (
    user_preference_id INTEGER NOT NULL,
    allergen_id INTEGER NOT NULL,
    PRIMARY KEY (user_preference_id, allergen_id),
    FOREIGN KEY (user_preference_id) REFERENCES user_preferences(id) ON DELETE CASCADE,
    FOREIGN KEY (allergen_id) REFERENCES allergens(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS recipes (
    id INTEGER PRIMARY KEY,
    title TEXT NOT NULL,
    url TEXT,
    description TEXT,
    difficulty TEXT,
    cost TEXT,
    total_time_minutes INTEGER,
    calories INTEGER NOT NULL DEFAULT 0,
    protein_g REAL NOT NULL DEFAULT 0,
    fat_g REAL NOT NULL DEFAULT 0,
    carbs_g REAL NOT NULL DEFAULT 0,
    instructions TEXT,
    image_url TEXT,
    ingredients_json TEXT,
    dietary_category TEXT NOT NULL DEFAULT 'NONE',
    meal_types TEXT NOT NULL DEFAULT '[]'
);

CREATE TABLE IF NOT EXISTS meal_plans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    -- NUOVE COLONNE PER LO STORICO --
    total_calories_avg REAL, -- Media calorica giornaliera del piano
    dietary_preference_snapshot TEXT, -- Es. 'VEGETARIAN', 'NONE'
    difficulty_level_snapshot TEXT, -- Es. 'ANY', 'MEDIUM'
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS meal_plan_days (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    meal_plan_id INTEGER NOT NULL,
    day_of_week INTEGER NOT NULL,
    UNIQUE(meal_plan_id, day_of_week),
    FOREIGN KEY (meal_plan_id) REFERENCES meal_plans(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS meal_plan_meals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    meal_plan_day_id INTEGER NOT NULL,
    meal_type TEXT NOT NULL,
    recipe_id INTEGER NOT NULL,
    FOREIGN KEY (meal_plan_day_id) REFERENCES meal_plan_days(id) ON DELETE CASCADE,
    FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_meal_plans_user_id ON meal_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_recipes_calories ON recipes(calories);
CREATE INDEX IF NOT EXISTS idx_recipes_difficulty ON recipes(difficulty);
CREATE INDEX IF NOT EXISTS idx_recipes_dietary_category ON recipes(dietary_category);