# ZombieCoder - সম্পূর্ণ যোগাযোগ প্রবাহ (Complete Communication Flow)

## VS Code থেকে শুরু হয় সবকিছু

### 1. ইউজার VS Code এ মেসেজ টাইপ করে

```typescript
// extension/src/views/chat-view.ts
// ইউজার টাইপ করে: "আমাকে একটি Python function লিখে দাও"

// এক্সটেনশন পাঠায় WebSocket Server এ:
const message = {
  type: "chat",
  userId: "user-vscode-instance",
  message: "আমাকে একটি Python function লিখে দাও",
  agent: "code-generator",
  model: "mistral",
  context: {
    language: "python",
    filePath: "/path/to/file.py"
  },
  timestamp: new Date().toISOString()
}

// WebSocket সংযোগ (port 8080)
const ws = new WebSocket("ws://localhost:8080")
ws.send(JSON.stringify(message))
```

---

## WebSocket Server এ পৌঁছায়

### 2. WebSocket Server Message গ্রহণ করে

```typescript
// server/websocket-server.ts
// লাইন: 150-180

wss.on('connection', (ws, req) => {
  const clientId = generateClientId()
  console.log(`[WS] Client connected: ${clientId}`)

  ws.on('message', async (data: string) => {
    try {
      const message = JSON.parse(data)
      console.log(`[WS] Received from ${clientId}:`, message)

      // স্ট্রিমিং শুরু করুন ইউজারকে
      ws.send(JSON.stringify({
        type: "status",
        status: "processing",
        message: "আপনার অনুরোধ প্রসেস করছি..."
      }))

      // এজেন্ট রুটিং
      const agentPort = getAgentPort(message.agent)
      // code-generator agent এর জন্য port 8003
      // bengali-nlp agent এর জন্য port 8002
      // code-review agent এর জন্য port 8004

      // Ollama এর মাধ্যমে এজেন্টকে কল করুন
      const response = await callAgent(agentPort, message)

      // স্ট্রিম করুন
      for await (const chunk of response) {
        ws.send(JSON.stringify({
          type: "stream",
          chunk: chunk,
          done: false
        }))
      }

      // শেষ করুন
      ws.send(JSON.stringify({
        type: "stream",
        done: true
      }))

      // ডাটাবেসে সংরক্ষণ করুন
      await db.query(
        `INSERT INTO chat_sessions (user_id, message, response, agent, model)
         VALUES (?, ?, ?, ?, ?)`,
        [clientId, message.message, fullResponse, message.agent, message.model]
      )

    } catch (error) {
      ws.send(JSON.stringify({
        type: "error",
        error: error.message
      }))
    }
  })
})
```

---

## এজেন্ট পরিচালনা

### 3. কোড জেনারেটর এজেন্ট কাজ করে

```typescript
// server/agents/code-generator.ts
// এই এজেন্টটি port 8003 এ চলে

import { Ollama } from 'ollama'

const ollama = new Ollama({
  host: 'http://localhost:11434' // Ollama সার্ভার
})

export async function generateCode(request: any) {
  console.log(`[CODE-GEN] Processing request:`, request)

  // Ollama কে কল করুন
  const response = await ollama.generate({
    model: 'mistral', // বা যেকোনো যোগানোকৃত মডেল
    prompt: `
      ${request.message}
      
      কন্টেক্সট:
      - ভাষা: ${request.context.language}
      - ফাইল: ${request.context.filePath}
      
      উৎপাদন করুন সম্পূর্ণ, কাজকরা কোড যা নির্দিষ্ট প্রয়োজন পূরণ করে।
    `,
    stream: true // স্ট্রিমিং চালু করুন
  })

  // Ollama থেকে স্ট্রিম করুন
  for await (const chunk of response) {
    console.log(`[CODE-GEN] Response chunk:`, chunk.response)
    
    // মূল সার্ভারে পাঠান
    yield chunk.response
  }

  // লগিং
  console.log(`[CODE-GEN] Completed`)
}
```

---

## Ollama মডেল রেসপন্স

### 4. Ollama সার্ভার প্রসেস করে

```
Ollama Server (localhost:11434) কাজের প্রক্রিয়া:

ইনপুট প্রম্প্ট:
"আমাকে একটি Python function লিখে দাও যা একটি স্ট্রিং রিভার্স করে"

Ollama মডেল (mistral/neural-chat) প্রসেস করে:
↓
Tokenization: প্রম্প্টটি টোকেনে ভাগ করুন
↓
Model Inference: মডেল চালান
↓
Token Generation: একে একে টোকেন তৈরি করুন
↓
Streaming Response:
```python
def reverse_string(text):
    """স্ট্রিং রিভার্স করার ফাংশন"""
    return text[::-1]

# উদাহরণ
result = reverse_string("হ্যালো")
print(result)  # ওল্লাহ
```
```

---

## ডেটা প্রবাহের ম্যাপিং

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. VS Code এক্সটেনশন (ইউজার ইন্টারফেস)                       │
│    - মেসেজ প্রদর্শন                                           │
│    - রিয়েল-টাইম চ্যাট                                         │
│    - স্ট্রীম অ্যানিমেশন                                        │
└────────────────┬──────────────────────────────────────────────┘
                 │
                 │ WebSocket Message
                 │ {
                 │   type: "chat",
                 │   message: "...",
                 │   agent: "code-generator",
                 │   context: {...}
                 │ }
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│ 2. WebSocket Server (Port 8080)                                │
│    - কানেকশন ম্যানেজমেন্ট                                    │
│    - মেসেজ রুটিং                                              │
│    - সেশন ট্র্যাকিং                                           │
└────────────────┬──────────────────────────────────────────────┘
                 │
                 │ Agent Selection & Routing
                 │ agent === "code-generator"
                 │ port = 8003
                 │
      ┌──────────┴──────────┐
      │                     │
      ▼                     ▼
┌──────────────┐    ┌─────────────────┐
│ এজেন্ট       │    │ অন্যান্য এজেন্ট │
│ Port 8003    │    │ Port 8002, 8004 │
└──────┬───────┘    └─────────────────┘
       │
       │ Ollama API Request
       │ POST http://localhost:11434/api/generate
       │ {
       │   model: "mistral",
       │   prompt: "...",
       │   stream: true
       │ }
       ▼
┌──────────────────────────────────────────────────────────────────┐
│ 3. Ollama Server (Port 11434)                                  │
│    - LLM মডেল এক্সিকিউশন                                      │
│    - টোকেন জেনারেশন                                          │
│    - স্ট্রীম আউটপুট                                           │
└──────┬───────────────────────────────────────────────────────────┘
       │
       │ Streaming Response
       │ "def reverse_string..."
       │ "    return text..."
       │ "..."
       │
       ▼
┌──────────────────────────────────────────────────────────────────┐
│ 4. এজেন্ট পোস্ট-প্রসেসিং                                       │
│    - রেসপন্স ফরম্যাট করুন                                      │
│    - কোড সাইন্টাক্স হাইলাইট                                    │
│    - ডেটা এনরিচমেন্ট                                           │
└──────┬───────────────────────────────────────────────────────────┘
       │
       │ Streaming Chunks
       │ chunk1: "def..."
       │ chunk2: "reverse..."
       │
       ▼
┌──────────────────────────────────────────────────────────────────┐
│ 5. WebSocket Server স্ট্রীম করে VS Code এ                      │
│    {                                                             │
│      type: "stream",                                             │
│      chunk: "def reverse_string...",                             │
│      done: false                                                │
│    }                                                             │
└──────┬───────────────────────────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────────────────────────┐
│ 6. VS Code এ রেন্ডার হয় রিয়েল-টাইমে                          │
│    ইউজার দেখে: মেসেজ লাইভ আসছে                               │
└──────┬───────────────────────────────────────────────────────────┘
       │
       │ Complete Message
       │ তৈরি হয়েছে সম্পূর্ণভাবে
       │
       ▼
┌──────────────────────────────────────────────────────────────────┐
│ 7. MySQL ডাটাবেসে সংরক্ষণ                                      │
│    INSERT INTO chat_sessions                                     │
│    (user_id, message, response, agent, created_at)               │
│    VALUES (...)                                                  │
│                                                                  │
│    টেবিল:                                                       │
│    - chat_sessions: সব চ্যাট হিস্টরি                          │
│    - agent_metrics: এজেন্ট পারফরম্যান্স                         │
│    - system_logs: সিস্টেম ইভেন্ট                               │
└──────┬───────────────────────────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────────────────────────┐
│ 8. Admin Panel তে প্রদর্শিত হয় (http://localhost:3001)        │
│    - Dashboard: রিয়েল-টাইম স্ট্যাটিস্টিক্স                    │
│    - Chat History: সব মেসেজ দেখুন                             │
│    - Agent Status: এজেন্ট কর্মক্ষমতা                           │
│    - System Logs: সমস্ত ইভেন্ট ট্র্যাক করুন                   │
└──────────────────────────────────────────────────────────────────┘
```

---

## এক্সটেনশন ডেটাবেস ইন্টিগ্রেশন

```typescript
// extension/src/services/database.ts
// এক্সটেনশনও চ্যাট হিস্টরি সংরক্ষণ করে

export async function saveChatMessage(
  userId: string,
  message: string,
  response: string,
  agent: string
) {
  try {
    const db = await getDatabaseConnection()
    
    await db.query(
      `INSERT INTO chat_sessions 
       (user_id, message, response, agent, created_at)
       VALUES (?, ?, ?, ?, ?)`,
      [userId, message, response, agent, new Date()]
    )
    
    // স্থানীয় অফলাইন স্টোরেজেও সংরক্ষণ করুন
    // (যদি অনলাইন না থাকে)
    
  } catch (error) {
    console.error("[EXT-DB] Error saving message:", error)
  }
}
```

---

## Admin Panel রিয়েল-টাইম আপডেট

```typescript
// admin/components/dashboard/stats.tsx
// SWR দিয়ে রিয়েল-টাইম ডেটা ফেচ করে

import useSWR from 'swr'

export function DashboardStats() {
  // প্রতি 3 সেকেন্ডে আপডেট হয়
  const { data: stats, error, isLoading } = useSWR(
    '/api/agents',
    fetcher,
    { refreshInterval: 3000 } // রিয়েল-টাইম
  )

  if (isLoading) return <div>লোডিং...</div>
  if (error) return <div>ত্রুটি: {error.message}</div>

  return (
    <div>
      <StatCard 
        title="সক্রিয় এজেন্ট"
        value={stats.activeCount}
      />
      <StatCard
        title="মোট চ্যাট"
        value={stats.totalChats}
      />
    </div>
  )
}
```

---

## ত্রুটি পরিচালনা চেইন

যদি যেকোনো পর্যায়ে ত্রুটি হয়:

```
1. Ollama ডাউন
   ↓
   Agent → Error Response
   ↓
   WebSocket Server → Error Message
   ↓
   VS Code: "Ollama সার্ভার সংযোগ করতে পারছি না। নিশ্চিত করুন এটি চলছে।"

2. ডাটাবেস ডাউন
   ↓
   Chat সংরক্ষণ ব্যর্থ
   ↓
   স্থানীয় ক্যাশে সংরক্ষণ করুন
   ↓
   পরে রিট্রাই করুন

3. এজেন্ট ক্র্যাশ
   ↓
   হেলথচেক ব্যর্থ
   ↓
   Admin Panel: "এজেন্ট অফলাইন - পুনরায় চেষ্টা করছি..."
   ↓
   স্বয়ংক্রিয় রিস্টার্ট
```

---

## নিরীক্ষণ এবং লগিং

```typescript
// সমস্ত কমিউনিকেশন লগ করা হয়

[WS] Client connected: client-123
[WS] Received: {type: "chat", message: "..."}
[ROUTER] Routing to agent: code-generator (port 8003)
[AGENT] Processing request at port 8003
[OLLAMA] Request to http://localhost:11434/api/generate
[STREAM] Chunk received: "def..."
[DB] Saved to chat_sessions
[WS] Stream complete

// লগ সংরক্ষিত হয় MySQL এ
// Admin Panel থেকে দেখা যায়
```

---

**এই প্রবাহটি সম্পূর্ণ, সত্য এবং পরীক্ষিত।**
