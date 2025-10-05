# API Documentation

## Overview

ZombieCoder provides a RESTful API and streaming endpoints for interacting with AI agents. The API follows OpenAI-compatible standards for easy integration.

## Base URL

\`\`\`
http://localhost:8001
\`\`\`

## Authentication

All API requests require an API key in the Authorization header:

\`\`\`http
Authorization: Bearer zombiecoder-gateway-token
\`\`\`

## Endpoints

### Health Check

Check if the server is running.

**Endpoint:** `GET /health`

**Response:**
\`\`\`json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00Z",
  "version": "1.0.0"
}
\`\`\`

### List Models

Get available AI models.

**Endpoint:** `GET /v1/models`

**Response:**
\`\`\`json
{
  "object": "list",
  "data": [
    {
      "id": "codellama",
      "object": "model",
      "created": 1704000000,
      "owned_by": "ollama"
    },
    {
      "id": "llama2",
      "object": "model",
      "created": 1704000000,
      "owned_by": "ollama"
    }
  ]
}
\`\`\`

### Chat Completion

Send a chat message and get a response.

**Endpoint:** `POST /v1/chat/completions`

**Request Body:**
\`\`\`json
{
  "model": "codellama",
  "messages": [
    {
      "role": "user",
      "content": "Write a function to sort an array"
    }
  ],
  "temperature": 0.7,
  "max_tokens": 2048,
  "stream": false
}
\`\`\`

**Response:**
\`\`\`json
{
  "id": "chatcmpl-123",
  "object": "chat.completion",
  "created": 1704000000,
  "model": "codellama",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "Here's a function to sort an array:\n\n```javascript\nfunction sortArray(arr) {\n  return arr.sort((a, b) => a - b);\n}\n```"
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 10,
    "completion_tokens": 50,
    "total_tokens": 60
  }
}
\`\`\`

### Streaming Chat

Get real-time streaming responses.

**Endpoint:** `POST /v1/chat/completions`

**Request Body:**
\`\`\`json
{
  "model": "codellama",
  "messages": [
    {
      "role": "user",
      "content": "Explain async/await"
    }
  ],
  "stream": true
}
\`\`\`

**Response:** Server-Sent Events (SSE)

\`\`\`
data: {"id":"chatcmpl-123","object":"chat.completion.chunk","created":1704000000,"model":"codellama","choices":[{"index":0,"delta":{"role":"assistant"},"finish_reason":null}]}

data: {"id":"chatcmpl-123","object":"chat.completion.chunk","created":1704000000,"model":"codellama","choices":[{"index":0,"delta":{"content":"Async"},"finish_reason":null}]}

data: {"id":"chatcmpl-123","object":"chat.completion.chunk","created":1704000000,"model":"codellama","choices":[{"index":0,"delta":{"content":"/await"},"finish_reason":null}]}

data: [DONE]
\`\`\`

### Code Generation

Generate code from a prompt.

**Endpoint:** `POST /api/generate`

**Request Body:**
\`\`\`json
{
  "prompt": "Create a REST API endpoint for user authentication",
  "language": "javascript",
  "framework": "express"
}
\`\`\`

**Response:**
\`\`\`json
{
  "code": "const express = require('express');\nconst router = express.Router();\n\nrouter.post('/auth/login', async (req, res) => {\n  // Authentication logic\n});",
  "explanation": "This creates an Express.js authentication endpoint...",
  "language": "javascript"
}
\`\`\`

### Code Review

Review code for issues and improvements.

**Endpoint:** `POST /api/review`

**Request Body:**
\`\`\`json
{
  "code": "function add(a, b) { return a + b }",
  "language": "javascript"
}
\`\`\`

**Response:**
\`\`\`json
{
  "summary": "Code is functional but lacks type safety and error handling",
  "issues": [
    {
      "severity": "warning",
      "message": "Missing semicolon",
      "line": 1
    },
    {
      "severity": "info",
      "message": "Consider adding JSDoc comments",
      "line": 1
    }
  ],
  "suggestions": [
    "Add parameter type checking",
    "Include error handling for non-numeric inputs",
    "Add JSDoc documentation"
  ]
}
\`\`\`

### Code Explanation

Get an explanation of code.

**Endpoint:** `POST /api/explain`

**Request Body:**
\`\`\`json
{
  "code": "const result = await Promise.all(promises);",
  "language": "javascript"
}
\`\`\`

**Response:**
\`\`\`json
{
  "explanation": "This code uses Promise.all() to wait for multiple promises to resolve concurrently. The await keyword pauses execution until all promises complete, then assigns the results to the 'result' variable."
}
\`\`\`

### Bengali Translation

Translate text to Bengali.

**Endpoint:** `POST /api/translate`

**Request Body:**
\`\`\`json
{
  "text": "Hello, how can I help you?",
  "target": "bn"
}
\`\`\`

**Response:**
\`\`\`json
{
  "translation": "হ্যালো, আমি কিভাবে আপনাকে সাহায্য করতে পারি?"
}
\`\`\`

## Agent-Specific Endpoints

### Bengali NLP Agent

**Port:** 8002

**Endpoint:** `POST http://localhost:8002/process`

**Request:**
\`\`\`json
{
  "text": "কোড লিখো",
  "action": "translate"
}
\`\`\`

### Code Generation Agent

**Port:** 8003

**Endpoint:** `POST http://localhost:8003/generate`

**Request:**
\`\`\`json
{
  "prompt": "Create a React component",
  "language": "javascript"
}
\`\`\`

### Code Review Agent

**Port:** 8004

**Endpoint:** `POST http://localhost:8004/review`

**Request:**
\`\`\`json
{
  "code": "function example() { }",
  "language": "javascript"
}
\`\`\`

## Error Handling

### Error Response Format

\`\`\`json
{
  "error": {
    "message": "Invalid API key",
    "type": "authentication_error",
    "code": "invalid_api_key"
  }
}
\`\`\`

### HTTP Status Codes

- `200 OK`: Successful request
- `400 Bad Request`: Invalid request parameters
- `401 Unauthorized`: Missing or invalid API key
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error
- `503 Service Unavailable`: Service temporarily unavailable

## Rate Limiting

- **Free Tier**: 100 requests per hour
- **Pro Tier**: 1000 requests per hour
- **Enterprise**: Unlimited

Rate limit headers:
\`\`\`http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1704003600
\`\`\`

## WebSocket API

For real-time bidirectional communication.

**Endpoint:** `ws://localhost:8001/ws`

**Connection:**
\`\`\`javascript
const ws = new WebSocket('ws://localhost:8001/ws');

ws.onopen = () => {
  ws.send(JSON.stringify({
    type: 'auth',
    token: 'zombiecoder-gateway-token'
  }));
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log(data);
};
\`\`\`

## SDK Examples

### JavaScript/TypeScript

\`\`\`typescript
import { ZombieCoderClient } from 'zombiecoder-sdk';

const client = new ZombieCoderClient({
  apiKey: 'zombiecoder-gateway-token',
  baseURL: 'http://localhost:8001'
});

// Chat
const response = await client.chat('Write a function');

// Streaming
for await (const chunk of client.chatStream('Explain async')) {
  process.stdout.write(chunk);
}

// Code generation
const code = await client.generateCode('Create a REST API');
\`\`\`

### Python

\`\`\`python
from zombiecoder import Client

client = Client(
    api_key='zombiecoder-gateway-token',
    base_url='http://localhost:8001'
)

# Chat
response = client.chat('Write a function')

# Streaming
for chunk in client.chat_stream('Explain async'):
    print(chunk, end='')

# Code generation
code = client.generate_code('Create a REST API')
\`\`\`

### cURL

\`\`\`bash
# Chat
curl -X POST http://localhost:8001/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer zombiecoder-gateway-token" \
  -d '{
    "model": "codellama",
    "messages": [{"role": "user", "content": "Hello"}]
  }'

# Streaming
curl -X POST http://localhost:8001/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer zombiecoder-gateway-token" \
  -d '{
    "model": "codellama",
    "messages": [{"role": "user", "content": "Hello"}],
    "stream": true
  }'
\`\`\`

## Best Practices

1. **Use Streaming**: For better UX, use streaming endpoints
2. **Handle Errors**: Always implement proper error handling
3. **Rate Limiting**: Respect rate limits and implement backoff
4. **Timeouts**: Set appropriate timeouts for requests
5. **Caching**: Cache responses when appropriate
6. **Security**: Never expose API keys in client-side code
