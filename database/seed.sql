-- ZombieCoder Bengali Extension - Seed Data
-- Initial data for system setup

-- Insert default system configuration
INSERT INTO system_config (config_key, config_value, config_type, description) VALUES
('gateway_port', '8001', 'number', 'Gateway server port'),
('gateway_host', 'localhost', 'string', 'Gateway server host'),
('gateway_token', 'zombiecoder-gateway-token', 'string', 'Gateway authentication token'),
('ollama_host', 'http://localhost:11434', 'string', 'Ollama server URL'),
('admin_port', '3000', 'number', 'Admin panel port'),
('max_tokens', '2048', 'number', 'Maximum tokens per request'),
('temperature', '0.7', 'number', 'Default temperature for AI models'),
('stream_enabled', 'true', 'boolean', 'Enable streaming responses'),
('voice_enabled', 'true', 'boolean', 'Enable voice commands'),
('bengali_support', 'true', 'boolean', 'Enable Bengali language support');

-- Insert default agents
INSERT INTO agents (name, type, description, port, endpoint, capabilities, config, status) VALUES
('Bengali NLP', 'nlp', 'Bengali language processing and translation', 8002, '/process', '["translation", "sentiment", "tokenization"]', '{"language": "bengali", "models": ["bnlp"]}', 'active'),
('Code Generator', 'generator', 'AI-powered code generation', 8003, '/generate', '["code_generation", "completion", "refactoring"]', '{"languages": ["javascript", "typescript", "python"]}', 'active'),
('Code Review', 'reviewer', 'Automated code review and analysis', 8004, '/review', '["code_review", "bug_detection", "optimization"]', '{"severity_levels": ["low", "medium", "high"]}', 'active'),
('Documentation', 'documentation', 'Automatic documentation generation', 8005, '/document', '["doc_generation", "api_docs", "comments"]', '{"formats": ["markdown", "html", "jsdoc"]}', 'active'),
('Testing', 'testing', 'Test case generation and execution', 8006, '/test', '["unit_tests", "integration_tests", "e2e_tests"]', '{"frameworks": ["jest", "mocha", "pytest"]}', 'active'),
('Deployment', 'deployment', 'Deployment automation and CI/CD', 8007, '/deploy', '["docker", "kubernetes", "ci_cd"]', '{"platforms": ["vercel", "aws", "gcp"]}', 'active'),
('Voice Processor', 'voice', 'Voice command processing', 8014, '/voice', '["speech_to_text", "text_to_speech", "bengali_voice"]', '{"languages": ["bengali", "english"]}', 'active');

-- Insert default AI providers
INSERT INTO ai_providers (name, provider_type, api_url, models, status, config) VALUES
('Ollama', 'local', 'http://localhost:11434', '["codellama:7b", "mistral:7b", "llama2:7b"]', 'active', '{"type": "local", "requires_api_key": false}'),
('OpenRouter', 'cloud', 'https://openrouter.ai/api/v1', '["gpt-3.5-turbo", "gpt-4", "claude-3"]', 'inactive', '{"type": "cloud", "requires_api_key": true}'),
('Together AI', 'cloud', 'https://api.together.xyz/v1', '["mistralai/Mixtral-8x7B", "meta-llama/Llama-2-70b"]', 'inactive', '{"type": "cloud", "requires_api_key": true}'),
('HuggingFace', 'cloud', 'https://api-inference.huggingface.co', '["bigcode/starcoder", "codellama/CodeLlama-34b"]', 'inactive', '{"type": "cloud", "requires_api_key": true}');

-- Insert default models
INSERT INTO models (provider_id, name, model_id, description, context_length, max_tokens, is_local) VALUES
(1, 'CodeLlama 7B', 'codellama:7b', 'Code generation and completion', 4096, 2048, TRUE),
(1, 'Mistral 7B', 'mistral:7b', 'General purpose language model', 8192, 2048, TRUE),
(1, 'Llama 2 7B', 'llama2:7b', 'Conversational AI model', 4096, 2048, TRUE),
(2, 'GPT-3.5 Turbo', 'gpt-3.5-turbo', 'Fast and efficient OpenAI model', 16384, 4096, FALSE),
(2, 'GPT-4', 'gpt-4', 'Most capable OpenAI model', 32768, 8192, FALSE),
(3, 'Mixtral 8x7B', 'mistralai/Mixtral-8x7B-Instruct-v0.1', 'Mixture of experts model', 32768, 4096, FALSE),
(4, 'StarCoder', 'bigcode/starcoder', 'Code generation specialist', 8192, 2048, FALSE);

-- Insert default admin user (password: admin123 - CHANGE THIS!)
INSERT INTO users (username, email, password_hash, full_name, role) VALUES
('admin', 'admin@zombiecoder.local', '$2b$10$rKvVPZqGvVZqGvVZqGvVZuO8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K', 'System Administrator', 'admin');

-- Insert default API key
INSERT INTO api_keys (user_id, key_name, api_key, permissions) VALUES
(1, 'Default Admin Key', 'zombiecoder-admin-key-' || SUBSTR(MD5(RANDOM()::text), 1, 32), '["read", "write", "admin"]');

-- Insert Bengali voice commands mapping
INSERT INTO voice_commands (user_id, command_bengali, command_english, action, confidence, was_successful) VALUES
(1, 'কোড লিখুন', 'write code', 'generate_code', 0.95, TRUE),
(1, 'ফাইল খুলুন', 'open file', 'open_file', 0.92, TRUE),
(1, 'সংরক্ষণ করুন', 'save', 'save_file', 0.98, TRUE),
(1, 'চালান', 'run', 'execute_code', 0.96, TRUE),
(1, 'পরীক্ষা করুন', 'test', 'run_tests', 0.94, TRUE);
