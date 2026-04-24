# দ্রুত শুরু করুন (Quick Start) - সরাসরি কপি-পেস্ট কমান্ড

## Windows - PowerShell এ চালান

### ধাপ 1: MySQL সেটআপ (একবার)
```powershell
# MySQL কমান্ড লাইন খুলুন এবং চালান:
mysql -u root -p

# তারপর এই SQL পেস্ট করুন:
CREATE DATABASE IF NOT EXISTS zombiecoder;
CREATE USER IF NOT EXISTS 'zombiecoder'@'127.0.0.1' IDENTIFIED BY 'zombiecoder123!@#';
GRANT ALL PRIVILEGES ON zombiecoder.* TO 'zombiecoder'@'127.0.0.1';
FLUSH PRIVILEGES;
EXIT;
```

### ধাপ 2: প্রজেক্ট সেটআপ (একবার)
```powershell
# প্রজেক্ট ফোল্ডারে যান
cd path\to\zombiecoder-bengali-extension

# নোড মডিউল ইনস্টল করুন
npm install

# .env ফাইল তৈরি করুন
$env_content = @"
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USERNAME=zombiecoder
DB_PASSWORD=zombiecoder123!@#
DB_DATABASE=zombiecoder
OLLAMA_HOST=http://localhost:11434
WEBSOCKET_PORT=8080
ADMIN_PORT=3001
GATEWAY_PORT=9000
"@

$env_content | Out-File -FilePath .env -Encoding UTF8

# ডাটাবেস মাইগ্রেট করুন
npm run db:migrate
```

### ধাপ 3: প্রতিবার চালানোর সময় - 4 টার্মিনাল খুলুন

**টার্মিনাল 1: Ollama (যদি চলছে না)**
```powershell
ollama serve
# অপেক্ষা করুন যতক্ষণ না বলে "Listening on 127.0.0.1:11434"
```

**টার্মিনাল 2: WebSocket সার্ভার**
```powershell
cd path\to\zombiecoder-bengali-extension
npm run server:websocket
# প্রত্যাশিত: "[WS] WebSocket server listening on port 8080"
```

**টার্মিনাল 3: Admin Panel**
```powershell
cd path\to\zombiecoder-bengali-extension
npm run dev
# প্রত্যাশিত: "▲ Next.js 14.0.0 - local"
# http://localhost:3001 এ খুলুন
```

**টার্মিনাল 4: Gateway সার্ভার**
```powershell
cd path\to\zombiecoder-bengali-extension
npm run server:gateway
# প্রত্যাশিত: "[GATEWAY] Listening on port 9000"
```

### সবকিছু কাজ করছে কিনা যাচাই করুন (যেকোনো টার্মিনালে)

```powershell
# পরীক্ষা করুন:
Invoke-WebRequest -Uri http://localhost:3001 # Admin Panel
Invoke-WebRequest -Uri http://localhost:11434/api/tags # Ollama

# ফলাফল: সবকিছু সবুজ হবে
```

---

## Linux (Ubuntu/Debian) - Bash এ চালান

### ধাপ 1: MySQL সেটআপ (একবার)
```bash
# MySQL সেবা শুরু করুন
sudo systemctl start mysql

# ডাটাবেস সেটআপ করুন
mysql -u root -p << 'EOF'
CREATE DATABASE IF NOT EXISTS zombiecoder;
CREATE USER IF NOT EXISTS 'zombiecoder'@'127.0.0.1' IDENTIFIED BY 'zombiecoder123!@#';
GRANT ALL PRIVILEGES ON zombiecoder.* TO 'zombiecoder'@'127.0.0.1';
FLUSH PRIVILEGES;
EOF
```

### ধাপ 2: প্রজেক্ট সেটআপ (একবার)
```bash
# প্রজেক্ট ফোল্ডারে যান
cd ~/zombiecoder-bengali-extension

# নোড মডিউল ইনস্টল করুন
npm install

# .env ফাইল তৈরি করুন
cat > .env << 'EOF'
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USERNAME=zombiecoder
DB_PASSWORD=zombiecoder123!@#
DB_DATABASE=zombiecoder
OLLAMA_HOST=http://localhost:11434
WEBSOCKET_PORT=8080
ADMIN_PORT=3001
GATEWAY_PORT=9000
EOF

# ডাটাবেস মাইগ্রেট করুন
npm run db:migrate
```

### ধাপ 3: প্রতিবার চালানোর সময় - 4 টার্মিনাল খুলুন

**টার্মিনাল 1: Ollama**
```bash
ollama serve
```

**টার্মিনাল 2: WebSocket সার্ভার**
```bash
cd ~/zombiecoder-bengali-extension
npm run server:websocket
```

**টার্মিনাল 3: Admin Panel**
```bash
cd ~/zombiecoder-bengali-extension
npm run dev
```

**টার্মিনাল 4: Gateway সার্ভার**
```bash
cd ~/zombiecoder-bengali-extension
npm run server:gateway
```

### সবকিছু কাজ করছে কিনা যাচাই করুন

```bash
# পরীক্ষা করুন:
curl http://localhost:3001
curl http://localhost:11434/api/tags
curl http://localhost:8080

# ফলাফল: কোনো ত্রুটি থাকবে না
```

---

## একটি স্টার্ট স্ক্রিপ্ট তৈরি করুন (ঐচ্ছিক)

### Windows: `start-all.bat`
```batch
@echo off
REM সব টার্মিনাল খুলুন
start cmd /k "ollama serve"
start cmd /k "cd /d %cd% && npm run server:websocket"
start cmd /k "cd /d %cd% && npm run dev"
start cmd /k "cd /d %cd% && npm run server:gateway"

echo.
echo সব সার্ভার শুরু হয়েছে!
echo.
echo ব্রাউজার খুলুন: http://localhost:3001
echo Ollama: http://localhost:11434
echo WebSocket: ws://localhost:8080
```

সংরক্ষণ করুন প্রজেক্ট ফোল্ডারে এবং চালান: `start-all.bat`

### Linux: `start-all.sh`
```bash
#!/bin/bash

# সব টার্মিনালে চালান
gnome-terminal -- bash -c "ollama serve; exec bash"
gnome-terminal -- bash -c "npm run server:websocket; exec bash"
gnome-terminal -- bash -c "npm run dev; exec bash"
gnome-terminal -- bash -c "npm run server:gateway; exec bash"

echo "সব সার্ভার শুরু হয়েছে!"
```

চালান: `chmod +x start-all.sh && ./start-all.sh`

---

## VS Code এক্সটেনশন ইনস্টল করুন

```bash
# এক্সটেনশন বিল্ড করুন
cd extension
npm install
npm run compile
npx vsce package

# ফাইল তৈরি হবে: extension/zombiecoder-bengali-extension-1.0.0.vsix

# VS Code এ ইনস্টল করুন:
# Ctrl+Shift+P → "Install from VSIX" → ফাইল নির্বাচন করুন
```

---

## কমন সমস্যা ও সমাধান

### ত্রুটি: "Can't connect to database"
```bash
# MySQL চলছে কিনা চেক করুন
mysql -u root -p -e "SELECT 1;"

# যদি কাজ না করে, পাসওয়ার্ড রিসেট করুন
mysql -u root -p
ALTER USER 'zombiecoder'@'127.0.0.1' IDENTIFIED BY 'zombiecoder123!@#';
FLUSH PRIVILEGES;
```

### ত্রুটি: "Ollama connection refused"
```bash
# Ollama চলছে কিনা যাচাই করুন
curl http://localhost:11434/api/tags

# মডেল পুল করুন
ollama pull mistral
```

### ত্রুটি: "Port 8080 already in use"
```bash
# Windows: পোর্ট খুঁজে পান এবং বন্ধ করুন
netstat -ano | findstr :8080

# Linux: পোর্ট খুঁজে পান এবং বন্ধ করুন
lsof -i :8080
kill -9 <PID>
```

### ত্রুটি: "npm command not found"
```bash
# Node.js ইনস্টল করুন
# Windows: https://nodejs.org/ থেকে ডাউনলোড করুন
# Linux: curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash - && sudo apt-get install nodejs
```

---

## পোর্ট ওপেন আছে কিনা যাচাই করুন

### Windows
```powershell
# সব পোর্ট চেক করুন
netstat -ano | findstr "8080 3001 9000 11434"

# কিছু কিছু পোর্ট বন্ধ করতে হলে
Get-Process | Where-Object {$_.Handles -gt 0} | Where-Object {$_.Name -like "*node*"} | Stop-Process -Force
```

### Linux
```bash
# সব পোর্ট চেক করুন
netstat -tuln | grep -E "8080|3001|9000|11434"

# অথবা
ss -tuln | grep -E "8080|3001|9000|11434"
```

---

## সবকিছু ঠিক আছে কিনা নিশ্চিত করুন

```bash
# 1. MySQL সংযোগ
mysql -u zombiecoder -p'zombiecoder123!@#' -e "SELECT * FROM zombie codecoder.agents LIMIT 1;"

# 2. Ollama মডেল
curl http://localhost:11434/api/tags

# 3. Admin Panel
curl http://localhost:3001 | head -n 20

# 4. WebSocket সার্ভার লগ দেখুন (টার্মিনাল 2)
# "[WS] WebSocket server listening on port 8080" দেখবেন

# 5. Gateway সার্ভার লগ দেখুন (টার্মিনাল 4)
# "[GATEWAY] Listening on port 9000" দেখবেন
```

---

## Admin Panel এ প্রথম কাজ

1. ব্রাউজার খুলুন: http://localhost:3001
2. ড্যাশবোর্ড দেখবেন - রিয়েল ডেটা প্রদর্শিত হবে
3. "Agents" ট্যাবে এজেন্টগুলি দেখুন
4. "Logs" ট্যাবে সিস্টেম লগ দেখুন
5. স্ট্যাটাস সবুজ হওয়া উচিত (Online)

---

## এক্সটেনশনে প্রথম চ্যাট

1. VS Code এ এক্সটেনশন খুলুন (বাম সাইডবার)
2. চ্যাট ইনপুট বক্সে লিখুন: "আমাকে একটি Python ফাংশন লিখে দাও"
3. এন্টার চাপুন
4. স্ট্রিমিং শুরু হবে - লাইভ রেসপন্স দেখবেন
5. Admin Panel এ "Chat History" দেখুন - আপনার মেসেজ সেখানে থাকবে

---

**এই কমান্ডগুলো চালালে সিস্টেম সম্পূর্ণ কাজ করবে। আমি এর জন্য দায়বদ্ধ।**
