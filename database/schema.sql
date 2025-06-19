-- database/schema.sql v.1.0
-- Schema iniziale del database per utenti, preferenze, ricette e piani alimentari.

-- 1. Tabella Utenti (collegata a Clerk)
-- Memorizza l'ID di Clerk per collegare le preferenze e i piani all'utente corretto.
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY NOT NULL, -- Corrisponde al Clerk User ID
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 2. Tabella Preferenze Utente
-- Contiene tutte le personalizzazioni necessarie per la generazione dei piani.
CREATE TABLE IF NOT EXISTS user_preferences (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT UNIQUE NOT NULL,
    calorie_target INTEGER DEFAULT 2000 NOT NULL,
    -- Salvato come stringa JSON, es: '{"breakfast": 30, "lunch": 40, "dinner": 30}'
    distribution TEXT NOT NULL,
    -- Valori possibili: 'NONE', 'VEGETARIAN', 'VEGAN', 'PESCATARIAN'
    dietary_preference TEXT DEFAULT 'NONE' NOT NULL,
    -- Valori possibili: 'EASY', 'MEDIUM', 'HARD'
    difficulty_level TEXT DEFAULT 'MEDIUM' NOT NULL,
    -- Salvato come array di stringhe JSON, es: '["Funghi", "Olive"]'
    disliked_ingredients TEXT DEFAULT '[]' NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Tabella Allergeni
-- Tabella di lookup per gli allergeni comuni.
CREATE TABLE IF NOT EXISTS allergens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    -- Nome univoco dell'allergene, es: "Glutine", "Lattosio"
    name TEXT UNIQUE NOT NULL
);

-- 4. Tabella di Giunzione (Molti-a-Molti) tra Preferenze e Allergeni
-- Collega gli utenti agli allergeni che vogliono evitare.
CREATE TABLE IF NOT EXISTS user_preferences_allergens (
    user_preference_id INTEGER NOT NULL,
    allergen_id INTEGER NOT NULL,
    PRIMARY KEY (user_preference_id, allergen_id),
    FOREIGN KEY (user_preference_id) REFERENCES user_preferences(id) ON DELETE CASCADE,
    FOREIGN KEY (allergen_id) REFERENCES allergens(id) ON DELETE CASCADE
);

-- 5. Tabella Ricette
-- Il catalogo di tutte le ricette disponibili per la generazione dei piani.
CREATE TABLE IF NOT EXISTS recipes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    -- Valori possibili: 'EASY', 'MEDIUM', 'HARD'
    difficulty TEXT NOT NULL,
    -- Calorie per porzione
    calories INTEGER NOT NULL,
    -- Tipo di pasto, salvato come stringa JSON, es: '["BREAKFAST"]' o '["LUNCH", "DINNER"]'
    meal_types TEXT NOT NULL,
    -- Tipo di dieta, es: 'VEGAN', 'VEGETARIAN', 'NONE'
    dietary_category TEXT NOT NULL,
    -- Ingredienti principali per filtri (es. allergeni), salvato come stringa JSON
    main_ingredients TEXT DEFAULT '[]' NOT NULL,
    -- Ingredienti completi per la lista della spesa, salvato come stringa JSON
    -- es: '[{"name": "Pomodoro", "quantity": 2, "unit": "pz"}, ...]'
    ingredients_json TEXT NOT NULL,
    -- Istruzioni, salvate come testo semplice o HTML
    instructions TEXT NOT NULL,
    image_url TEXT, -- Percorso all'immagine della ricetta
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 6. Tabella Piani Alimentari
-- Contiene la testata di un piano generato per un utente.
CREATE TABLE IF NOT EXISTS meal_plans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 7. Tabella Giorni del Piano Alimentare
-- Rappresenta un singolo giorno all'interno di un piano.
CREATE TABLE IF NOT EXISTS meal_plan_days (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    meal_plan_id INTEGER NOT NULL,
    -- Giorno della settimana (1=Lunedì, ..., 7=Domenica)
    day_of_week INTEGER NOT NULL,
    UNIQUE(meal_plan_id, day_of_week),
    FOREIGN KEY (meal_plan_id) REFERENCES meal_plans(id) ON DELETE CASCADE
);

-- 8. Tabella Pasti del Piano Alimentare
-- Rappresenta un singolo pasto (es. Pranzo del Lunedì) collegato a una ricetta specifica.
CREATE TABLE IF NOT EXISTS meal_plan_meals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    meal_plan_day_id INTEGER NOT NULL,
    -- Tipo di pasto: 'BREAKFAST', 'LUNCH', 'DINNER'
    meal_type TEXT NOT NULL,
    recipe_id INTEGER NOT NULL,
    FOREIGN KEY (meal_plan_day_id) REFERENCES meal_plan_days(id) ON DELETE CASCADE,
    FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE RESTRICT -- Non cancellare una ricetta se è in un piano
);

-- 9. Indici per ottimizzare le query
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_meal_plans_user_id ON meal_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_recipes_calories ON recipes(calories);
CREATE INDEX IF NOT EXISTS idx_recipes_difficulty ON recipes(difficulty);
CREATE INDEX IF NOT EXISTS idx_recipes_dietary_category ON recipes(dietary_category);