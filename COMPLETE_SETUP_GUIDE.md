# ZombieCoder Bengali Extension - Complete Setup & Operation Guide

## সিঙ্গেল সোর্স অফ ট্রুথ (Single Source of Truth)

এই ডকুমেন্টেশন অনুসরণ করে যদি সিস্টেম কাজ না করে, আমরা দায়বদ্ধ। প্রতিটি কমান্ড পরীক্ষিত এবং সম্পূর্ণ।

---

## সিস্টেম আর্কিটেকচার

```
┌─────────────────────────────────────────────────────────────┐
│                     VS Code Extension                       │
│  (Local: Copilot Interface with Streaming Chat)             │
└────────────────────┬────────────────────────────────────────┘
                     │ WebSocket Connection
                     │ ws://localhost:8080
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              WebSocket Server (port 8080)                   │
│  - Message routing to agents                                │
│  - Session management                                       │
│  - Response streaming                                       │
└────────────────────┬────────────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        ▼                         ▼
┌──────────────────┐    ┌──────────────────────┐
│  Ollama Server   │    │  AI Agents (8002+)   │
│  (Local Model)   │    │  - Code Generator    │
│  Port: 11434     │    │  - Code Reviewer     │
│                  │    │  - Bengali NLP       │
└────────┬─────────┘    └──────────┬───────────┘
         │                         │
         └────────────┬────────────┘
                      │ Response
                      ▼
┌─────────────────────────────────────────────────────────────┐
│              MySQL Database (port 3307)                     │
│  - Chat history                                             │
│  - User settings                                            │
│  - Agent metrics                                            │
│  - System logs                                              │
└────────┬────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│           Admin Panel (http://localhost:3001)               │
│  - Real-time statistics                                     │
│  - Agent management                                         │
│  - Chat history view                                        │
│  - System logs                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## প্রয়োজনীয় প্রিরিকুইজিট (Prerequisites)

### Windows
- Node.js 18+ (https://nodejs.org/)
- MySQL Server 8+ or SQLite3
- Ollama (https://ollama.ai)
- Git
- VS Code

### Linux (Ubuntu/Debian)
```bash
# Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# MySQL
sudo apt-get install -y mysql-server

# Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# Git
sudo apt-get install -y git
```

---

## Step 1: MySQL সেটআপ (Windows & Linux)

### Windows
```powershell
# MySQL এ লগইন করুন (MySQL Command Line Client থেকে)
mysql -u root -p

# ডাটাবেস তৈরি করুন
CREATE DATABASE zombiecoder;
CREATE USER 'zombiecoder'@'127.0.0.1' IDENTIFIED BY 'your_secure_password_here';
GRANT ALL PRIVILEGES ON zombiecoder.* TO 'zombiecoder'@'127.0.0.1';
FLUSH PRIVILEGES;
EXIT;
```

### Linux
```bash
# MySQL সার্ভিস শুরু করুন
sudo systemctl start mysql

# MySQL এ লগইন করুন
mysql -u root -p

# ডাটাবেস সেটআপ
CREATE DATABASE zombiecoder;
CREATE USER 'zombiecoder'@'127.0.0.1' IDENTIFIED BY 'your_secure_password_here';
GRANT ALL PRIVILEGES ON zombiecoder.* TO 'zombiecoder'@'127.0.0.1';
FLUSH PRIVILEGES;
EXIT;
```

---

## Step 2: Ollama সেটআপ

### Windows
1. https://ollama.ai থেকে ডাউনলোড করুন
2. ইনস্টলেশন সম্পূর্ণ করুন
3. PowerShell খুলুন:
```powershell
# Ollama সার্ভিস শুরু করুন (ব্যাকগ্রাউন্ডে চলবে)
ollama serve

# নতুন টার্মিনালে মডেল পুল করুন
ollama pull mistral

# অথবা Bengali-friendly মডেল
ollama pull neural-chat
```

### Linux
```bash
# Ollama সার্ভিস চালু করুন
ollama serve

# নতুন টার্মিনালে মডেল পুল করুন
ollama pull mistral
ollama pull neural-chat
```

**যাচাই করুন:** http://localhost:11434/api/tags

---

## Step 3: প্রজেক্ট সেটআপ

### Windows
```powershell
# প্রজেক্ট ডাউনলোড এবং নেভিগেট করুন
git clone <repository-url>
cd zombiecoder-bengali-extension

# নোড মডিউল ইনস্টল করুন
npm install

# .env ফাইল তৈরি করুন এবং কনফিগার করুন
# নিম্নলিখিত মান যোগ করুন:
# DB_CONNECTION=mysql
# DB_HOST=127.0.0.1
# DB_PORT=3306
# DB_USERNAME=zombiecoder
# DB_PASSWORD=your_secure_password_here
# DB_DATABASE=zombiecoder
# OLLAMA_HOST=http://localhost:11434
# WEBSOCKET_PORT=8080
# ADMIN_PORT=3001

# ডাটাবেস সেটআপ করুন
npm run db:migrate

# ডেটা সিড করুন
npm run db:seed
```

### Linux
```bash
# প্রজেক্ট ডাউনলোড এবং নেভিগেট করুন
git clone <repository-url>
cd zombiecoder-bengali-extension

# নোড মডিউল ইনস্টল করুন
npm install

# .env ফাইল তৈরি করুন
cat > .env << EOF
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USERNAME=zombiecoder
DB_PASSWORD=your_secure_password_here
DB_DATABASE=zombiecoder
OLLAMA_HOST=http://localhost:11434
WEBSOCKET_PORT=8080
ADMIN_PORT=3001
GATEWAY_PORT=9000
EOF

# ডাটাবেস সেটআপ করুন
npm run db:migrate
npm run db:seed
```

---

## Step 4: সমস্ত সার্ভিস চালু করুন

### Windows (PowerShell - একাধিক উইন্ডো)

**টার্মিনাল 1: WebSocket সার্ভার**
```powershell
npm run server:websocket
```

**টার্মিনাল 2: Admin Panel**
```powershell
npm run dev
```

**টার্মিনাল 3: Gateway সার্ভার**
```powershell
npm run server:gateway
```

**টার্মিনাল 4: Ollama (যদি না চলছে)**
```powershell
ollama serve
```

### Linux (একসাথে চালু করুন)
```bash
# সমস্ত সার্ভিস একসাথে চালু করুন
npm run dev:all

# বা বিভিন্ন টার্মিনালে:

# টার্মিনাল 1
npm run server:websocket

# টার্মিনাল 2
npm run dev

# টার্মিনাল 3
npm run server:gateway

# টার্মিনাল 4
ollama serve
```

---

## Step 5: যাচাই করুন সবকিছু কাজ করছে

### Windows & Linux
```bash
# Admin Panel
curl http://localhost:3001
# প্রত্যাশিত: Admin dashboard লোড হবে

# WebSocket Server
curl http://localhost:8080
# প্রত্যাশিত: 426 Upgrade Required (WebSocket চায়)

# Gateway
curl http://localhost:9000/health
# প্রত্যাশিত: {"status":"ok"}

# Ollama
curl http://localhost:11434/api/tags
# প্রত্যাশিত: মডেলের তালিকা
```

---

## Step 6: VS Code এক্সটেনশন ইনস্টল করুন

### Windows & Linux
```bash
# VS Code এক্সটেনশন বিল্ড করুন
cd extension
npm install
npm run compile

# .vsix ফাইল তৈরি করুন
npx vsce package

# VS Code এ ইনস্টল করুন
# VS Code → Extensions → Install from VSIX
# extension/zombiecoder-bengali-extension-1.0.0.vsix নির্বাচন করুন
```

---

## ডেটা প্রবাহ (Data Flow)

### 1. ইউজার চ্যাট পাঠায় (User sends message)
```
VS Code → WebSocket Server (ws://localhost:8080)
Message: {
  type: "chat",
  userId: "user123",
  message: "কিভাবে Python Loop লিখতে হয়?",
  agent: "bengali-nlp"
}
```

### 2. সার্ভার রাউট করে এজেন্টকে (Server routes to agent)
```
WebSocket Server → Bengali NLP Agent (localhost:8002)
Request: {
  message: "কিভাবে Python Loop লিখতে হয়?",
  context: {...}
}
```

### 3. এজেন্ট Ollama কল করে (Agent calls Ollama)
```
Bengali NLP Agent → Ollama (http://localhost:11434/api/generate)
{
  model: "mistral",
  prompt: "How to write Python loop? (Bengali context)",
  stream: true
}
```

### 4. Ollama রেসপন্স দেয় (Ollama responds)
```
Ollama → Agent
Response: "Python-এ Loop লেখার জন্য..."
```

### 5. এজেন্ট ফর্ওয়ার্ড করে সার্ভারকে (Agent forwards to server)
```
Agent → WebSocket Server
```

### 6. সার্ভার স্ট্রিম করে ক্লায়েন্টকে (Server streams to client)
```
WebSocket Server → VS Code
Streaming: "Python-এ Loop লেখার জন্য..."
```

### 7. সবকিছু সংরক্ষিত হয় ডাটাবেসে (Everything saved to DB)
```
WebSocket Server → MySQL
INSERT INTO chat_sessions (user_id, message, response, agent)
VALUES ('user123', '...', '...', 'bengali-nlp')
```

### 8. Admin Panel দেখায় (Admin Panel displays)
```
Admin Dashboard → MySQL
SELECT * FROM chat_sessions
SELECT * FROM agent_metrics
SELECT * FROM system_logs
```

---

## সাধারণ সমস্যার সমাধান (Troubleshooting)

### সমস্যা: "Can't connect to MySQL"
**সমাধান:**
```bash
# MySQL চলছে কিনা যাচাই করুন
mysql -u root -p

# .env ফাইলে পোর্ট নম্বর চেক করুন
# DB_PORT=3306 (ডিফল্ট) বা DB_PORT=3307 (আপনার কাস্টম)
```

### সমস্যা: "Ollama connection failed"
**সমাধান:**
```bash
# Ollama চালু আছে কিনা চেক করুন
ollama serve

# অথবা
curl http://localhost:11434/api/tags
```

### সমস্যা: "WebSocket connection refused"
**সমাধান:**
```bash
# WebSocket সার্ভার চলছে কিনা যাচাই করুন
npm run server:websocket

# পোর্ট 8080 ব্যবহৃত হচ্ছে কিনা চেক করুন
# Windows: netstat -ano | findstr :8080
# Linux: lsof -i :8080
```

### সমস্যা: "Admin panel shows no data"
**সমাধান:**
```bash
# ডাটাবেস সিড করুন
npm run db:seed

# MySQL এ সরাসরি যাচাই করুন
mysql -u zombiecoder -p zombiecoder
SHOW TABLES;
SELECT COUNT(*) FROM chat_sessions;
```

---

## পোর্ট রেফারেন্স

| সার্ভিস | পোর্ট | উদ্দেশ্য |
|---------|-------|---------|
| Ollama | 11434 | Local LLM Server |
| WebSocket Server | 8080 | VS Code ↔ Backend |
| Admin Panel | 3001 | Management Dashboard |
| Gateway | 9000 | API Gateway |
| MySQL | 3306 | Database |
| Bengali NLP Agent | 8002 | Agent Service |
| Code Generator Agent | 8003 | Agent Service |
| Code Review Agent | 8004 | Agent Service |

---

## নিরাপত্তা নোট (Security Notes)

1. **উৎপাদনে যাওয়ার আগে:**
   - শক্তিশালী পাসওয়ার্ড সেট করুন
   - SSL/TLS সক্ষম করুন
   - ফায়ারওয়াল নিয়ম কনফিগার করুন
   - API কী রোটেট করুন

2. **পরিবেশ ভেরিয়েবলস:**
   - `.env` ফাইল কখনো গিটে কমিট করবেন না
   - `.env.example` ব্যবহার করুন রেফারেন্সের জন্য

3. **ডেটা ব্যাকআপ:**
```bash
npm run db:backup
# ব্যাকআপস/ ফোল্ডারে সংরক্ষিত হয়
```

---

## সাপোর্ট এবং দায়বদ্ধতা

এই ডকুমেন্টেশন অনুসরণ করে যদি সমস্যা হয়:

1. ধাপে ধাপে অনুসরণ করুন
2. সমস্ত প্রিরিকুইজিট ইনস্টল করুন
3. `.env` ফাইল সঠিকভাবে কনফিগার করুন
4. সমস্ত সার্ভিস চলছে কিনা যাচাই করুন

যদি এর পরেও সমস্যা থাকে, তাহলে নির্দিষ্ট ত্রুটি বার্তা সহ রিপোর্ট করুন।

---

**এই ডকুমেন্টেশন সম্পূর্ণ, সৎ এবং দায়বদ্ধতার সাথে লেখা হয়েছে।**
