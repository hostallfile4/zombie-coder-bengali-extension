# Database Documentation

## Overview

ZombieCoder uses a MySQL database to store chat history, user preferences, agent metrics, and system logs. The database is designed for high performance and scalability.

## Database Configuration

### Environment Variables

\`\`\`env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3307
DB_DATABASE=zombiecoder
DB_USERNAME=root
DB_PASSWORD=105585
\`\`\`

### Connection Settings

- **Host**: 127.0.0.1 (localhost)
- **Port**: 3307 (custom MySQL port)
- **Database**: zombiecoder
- **Character Set**: utf8mb4
- **Collation**: utf8mb4_unicode_ci
- **Timezone**: UTC

## Database Schema

### Tables

#### 1. chat_history

Stores all chat interactions between users and AI agents.

\`\`\`sql
CREATE TABLE chat_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    session_id VARCHAR(255) NOT NULL,
    user_message TEXT NOT NULL,
    assistant_response TEXT NOT NULL,
    model VARCHAR(100),
    agent VARCHAR(100),
    tokens_used INT DEFAULT 0,
    response_time_ms INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_session (session_id),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
\`\`\`

**Fields:**
- `id`: Unique identifier for each chat message
- `session_id`: Groups messages from the same conversation
- `user_message`: The user's input message
- `assistant_response`: The AI's response
- `model`: AI model used (e.g., codellama, gpt-4)
- `agent`: Agent type (bengali_nlp, code_gen, etc.)
- `tokens_used`: Number of tokens consumed
- `response_time_ms`: Response time in milliseconds
- `created_at`: Timestamp of the message

#### 2. user_preferences

Stores user settings and preferences.

\`\`\`sql
CREATE TABLE user_preferences (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(255) UNIQUE NOT NULL,
    theme VARCHAR(50) DEFAULT 'dark',
    language VARCHAR(10) DEFAULT 'en',
    default_model VARCHAR(100) DEFAULT 'codellama',
    default_agent VARCHAR(100) DEFAULT 'general',
    max_tokens INT DEFAULT 2048,
    temperature DECIMAL(3,2) DEFAULT 0.70,
    streaming_enabled BOOLEAN DEFAULT TRUE,
    voice_enabled BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
\`\`\`

**Fields:**
- `user_id`: Unique identifier for the user
- `theme`: UI theme preference (dark/light)
- `language`: Preferred language (en/bn/auto)
- `default_model`: Default AI model
- `default_agent`: Default agent selection
- `max_tokens`: Maximum response length
- `temperature`: AI creativity level (0.0-2.0)
- `streaming_enabled`: Enable/disable streaming responses
- `voice_enabled`: Enable/disable voice commands

#### 3. agent_metrics

Tracks performance metrics for each AI agent.

\`\`\`sql
CREATE TABLE agent_metrics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    agent_name VARCHAR(100) NOT NULL,
    total_requests INT DEFAULT 0,
    successful_requests INT DEFAULT 0,
    failed_requests INT DEFAULT 0,
    avg_response_time_ms INT DEFAULT 0,
    total_tokens_used BIGINT DEFAULT 0,
    last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_agent (agent_name),
    INDEX idx_last_active (last_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
\`\`\`

**Fields:**
- `agent_name`: Name of the AI agent
- `total_requests`: Total number of requests
- `successful_requests`: Number of successful responses
- `failed_requests`: Number of failed requests
- `avg_response_time_ms`: Average response time
- `total_tokens_used`: Total tokens consumed
- `last_active`: Last activity timestamp

#### 4. system_logs

Stores system events and error logs.

\`\`\`sql
CREATE TABLE system_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    level VARCHAR(20) NOT NULL,
    component VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    stack_trace TEXT,
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_level (level),
    INDEX idx_component (component),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
\`\`\`

**Fields:**
- `level`: Log level (info/warn/error/debug)
- `component`: System component (gateway/agent/extension)
- `message`: Log message
- `stack_trace`: Error stack trace (if applicable)
- `metadata`: Additional JSON metadata
- `created_at`: Log timestamp

## Database Operations

### Initialization

Run the initialization script to create all tables:

\`\`\`bash
npm run db:init
\`\`\`

This executes `scripts/init-database.sql` which creates all tables with proper indexes and constraints.

### Seeding Data

Populate the database with sample data:

\`\`\`bash
npm run db:seed
\`\`\`

This executes `scripts/seed-database.sql` which inserts:
- Sample chat history
- Default user preferences
- Initial agent metrics

### Backup

Create a database backup:

\`\`\`bash
npm run db:backup
\`\`\`

Backups are stored in the `backups/` directory with timestamps.

### Restore

Restore from a backup:

\`\`\`bash
npm run db:restore backups/zombiecoder_2024-01-15.sql
\`\`\`

## Query Examples

### Get Recent Chat History

\`\`\`sql
SELECT 
    user_message,
    assistant_response,
    model,
    response_time_ms,
    created_at
FROM chat_history
WHERE session_id = 'session-123'
ORDER BY created_at DESC
LIMIT 50;
\`\`\`

### Get Agent Performance

\`\`\`sql
SELECT 
    agent_name,
    total_requests,
    successful_requests,
    ROUND((successful_requests / total_requests * 100), 2) as success_rate,
    avg_response_time_ms,
    total_tokens_used
FROM agent_metrics
ORDER BY total_requests DESC;
\`\`\`

### Get User Preferences

\`\`\`sql
SELECT 
    theme,
    language,
    default_model,
    streaming_enabled
FROM user_preferences
WHERE user_id = 'user-123';
\`\`\`

### Get Error Logs

\`\`\`sql
SELECT 
    component,
    message,
    stack_trace,
    created_at
FROM system_logs
WHERE level = 'error'
AND created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
ORDER BY created_at DESC;
\`\`\`

## Performance Optimization

### Indexes

All tables have appropriate indexes for common queries:
- `chat_history`: session_id, created_at
- `user_preferences`: user_id
- `agent_metrics`: agent_name, last_active
- `system_logs`: level, component, created_at

### Connection Pooling

The application uses connection pooling for better performance:

\`\`\`javascript
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  connectionLimit: 10,
  queueLimit: 0
});
\`\`\`

### Query Optimization

- Use prepared statements to prevent SQL injection
- Limit result sets with LIMIT clauses
- Use indexes for WHERE and ORDER BY clauses
- Avoid SELECT * queries

## Maintenance

### Regular Tasks

1. **Backup Database** (Daily)
   \`\`\`bash
   npm run db:backup
   \`\`\`

2. **Clean Old Logs** (Weekly)
   \`\`\`sql
   DELETE FROM system_logs 
   WHERE created_at < DATE_SUB(NOW(), INTERVAL 30 DAY);
   \`\`\`

3. **Optimize Tables** (Monthly)
   \`\`\`sql
   OPTIMIZE TABLE chat_history, user_preferences, agent_metrics, system_logs;
   \`\`\`

4. **Analyze Performance** (Monthly)
   \`\`\`sql
   ANALYZE TABLE chat_history, user_preferences, agent_metrics, system_logs;
   \`\`\`

## Troubleshooting

### Connection Issues

If you can't connect to the database:

1. Check MySQL is running:
   \`\`\`bash
   sudo systemctl status mysql
   \`\`\`

2. Verify port is correct (3307):
   \`\`\`bash
   netstat -tlnp | grep 3307
   \`\`\`

3. Test connection:
   \`\`\`bash
   mysql -h 127.0.0.1 -P 3307 -u root -p
   \`\`\`

### Slow Queries

Enable slow query log:

\`\`\`sql
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 2;
\`\`\`

View slow queries:

\`\`\`bash
tail -f /var/log/mysql/slow-query.log
\`\`\`

### Disk Space

Check database size:

\`\`\`sql
SELECT 
    table_schema AS 'Database',
    ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS 'Size (MB)'
FROM information_schema.tables
WHERE table_schema = 'zombiecoder'
GROUP BY table_schema;
\`\`\`

## Security

### Best Practices

1. **Use Strong Passwords**: Never use default passwords in production
2. **Limit Privileges**: Create separate users with minimal required privileges
3. **Enable SSL**: Use encrypted connections for remote access
4. **Regular Backups**: Automate daily backups
5. **Monitor Access**: Review system_logs regularly for suspicious activity

### Creating Limited User

\`\`\`sql
CREATE USER 'zombiecoder_app'@'localhost' IDENTIFIED BY 'secure_password';
GRANT SELECT, INSERT, UPDATE ON zombiecoder.* TO 'zombiecoder_app'@'localhost';
FLUSH PRIVILEGES;
\`\`\`

## Migration

### Adding New Tables

1. Create migration script in `scripts/migrations/`
2. Run migration:
   \`\`\`bash
   npm run db:migrate
   \`\`\`

### Modifying Existing Tables

Always create a backup before modifying tables:

\`\`\`bash
npm run db:backup
mysql -h 127.0.0.1 -P 3307 -u root -p zombiecoder < scripts/migrations/001_add_column.sql
\`\`\`

## Monitoring

### Admin Panel

Access the admin panel at http://localhost:3000 to view:
- Real-time database statistics
- Chat history
- Agent performance metrics
- System logs

### Database Health

Check database health:

\`\`\`sql
SHOW STATUS LIKE 'Threads_connected';
SHOW STATUS LIKE 'Questions';
SHOW STATUS LIKE 'Uptime';
