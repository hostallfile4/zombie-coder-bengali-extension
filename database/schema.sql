-- ZombieCoder Bengali Extension - Database Schema
-- Supports both MySQL and SQLite

-- System Configuration Table
CREATE TABLE IF NOT EXISTS system_config (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    config_key VARCHAR(255) UNIQUE NOT NULL,
    config_value TEXT,
    config_type VARCHAR(50) DEFAULT 'string',
    description TEXT,
    is_encrypted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Agents Configuration Table
CREATE TABLE IF NOT EXISTS agents (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL,
    description TEXT,
    port INTEGER UNIQUE NOT NULL,
    host VARCHAR(255) DEFAULT 'localhost',
    status VARCHAR(50) DEFAULT 'inactive',
    endpoint VARCHAR(255),
    capabilities TEXT,
    config JSON,
    is_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- AI Providers Table
CREATE TABLE IF NOT EXISTS ai_providers (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) UNIQUE NOT NULL,
    provider_type VARCHAR(100) NOT NULL,
    api_key TEXT,
    api_url VARCHAR(500),
    models TEXT,
    status VARCHAR(50) DEFAULT 'inactive',
    config JSON,
    rate_limit INTEGER DEFAULT 100,
    is_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Models Table
CREATE TABLE IF NOT EXISTS models (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    provider_id INTEGER,
    name VARCHAR(255) NOT NULL,
    model_id VARCHAR(255) NOT NULL,
    description TEXT,
    context_length INTEGER DEFAULT 4096,
    max_tokens INTEGER DEFAULT 2048,
    temperature DECIMAL(3,2) DEFAULT 0.70,
    capabilities TEXT,
    is_local BOOLEAN DEFAULT FALSE,
    is_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (provider_id) REFERENCES ai_providers(id) ON DELETE CASCADE
);

-- Users Table (for Admin Panel)
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'user',
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- API Keys Table
CREATE TABLE IF NOT EXISTS api_keys (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    user_id INTEGER,
    key_name VARCHAR(255) NOT NULL,
    api_key VARCHAR(500) UNIQUE NOT NULL,
    permissions TEXT,
    expires_at TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT TRUE,
    last_used TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Chat Sessions Table
CREATE TABLE IF NOT EXISTS chat_sessions (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    user_id INTEGER,
    session_id VARCHAR(255) UNIQUE NOT NULL,
    title VARCHAR(500),
    model_id INTEGER,
    agent_id INTEGER,
    context TEXT,
    metadata JSON,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (model_id) REFERENCES models(id) ON DELETE SET NULL,
    FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE SET NULL
);

-- Chat Messages Table
CREATE TABLE IF NOT EXISTS chat_messages (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    session_id INTEGER NOT NULL,
    role VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,
    tokens_used INTEGER DEFAULT 0,
    model_used VARCHAR(255),
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES chat_sessions(id) ON DELETE CASCADE
);

-- Code Snippets Table
CREATE TABLE IF NOT EXISTS code_snippets (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    user_id INTEGER,
    session_id INTEGER,
    title VARCHAR(500),
    description TEXT,
    language VARCHAR(100),
    code TEXT NOT NULL,
    tags TEXT,
    is_favorite BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (session_id) REFERENCES chat_sessions(id) ON DELETE SET NULL
);

-- File Index Table
CREATE TABLE IF NOT EXISTS file_index (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    file_path VARCHAR(1000) NOT NULL,
    file_name VARCHAR(500) NOT NULL,
    file_type VARCHAR(100),
    file_size INTEGER,
    language VARCHAR(100),
    content_hash VARCHAR(255),
    summary TEXT,
    functions TEXT,
    imports TEXT,
    exports TEXT,
    last_indexed TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Voice Commands Table
CREATE TABLE IF NOT EXISTS voice_commands (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    user_id INTEGER,
    command_text TEXT NOT NULL,
    command_bengali TEXT,
    command_english TEXT,
    action VARCHAR(255),
    confidence DECIMAL(5,4),
    was_successful BOOLEAN DEFAULT FALSE,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- System Logs Table
CREATE TABLE IF NOT EXISTS system_logs (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    log_level VARCHAR(50) NOT NULL,
    component VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    details JSON,
    user_id INTEGER,
    ip_address VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Analytics Table
CREATE TABLE IF NOT EXISTS analytics (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    event_type VARCHAR(255) NOT NULL,
    event_data JSON,
    user_id INTEGER,
    session_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (session_id) REFERENCES chat_sessions(id) ON DELETE SET NULL
);

-- Create Indexes for Performance
CREATE INDEX idx_agents_status ON agents(status);
CREATE INDEX idx_agents_port ON agents(port);
CREATE INDEX idx_providers_status ON ai_providers(status);
CREATE INDEX idx_models_provider ON models(provider_id);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_chat_sessions_user ON chat_sessions(user_id);
CREATE INDEX idx_chat_messages_session ON chat_messages(session_id);
CREATE INDEX idx_code_snippets_user ON code_snippets(user_id);
CREATE INDEX idx_file_index_path ON file_index(file_path);
CREATE INDEX idx_voice_commands_user ON voice_commands(user_id);
CREATE INDEX idx_system_logs_level ON system_logs(log_level);
CREATE INDEX idx_system_logs_component ON system_logs(component);
CREATE INDEX idx_analytics_event ON analytics(event_type);
