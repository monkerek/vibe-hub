# Semantic Mappings for Codebase Research

## Overview

These mappings help transform conceptual natural language terms into technical code patterns and keywords. Use them during the **Discovery** phase to identify relevant files.

## Mappings

### 🔐 Authentication & Authorization
- `authentication` → auth, login, verify, jwt, token, middleware
- `authorization` → auth, permission, access, role, check
- `login` → auth, login, signin, authenticate
- `logout` → logout, signout, session, clear

### 💾 Database & Storage
- `database` → db, sql, query, model, repository, dao
- `query` → query, select, find, search, filter
- `storage` → store, save, persist, db, repository

### 🌐 API & Networking
- `api` → api, endpoint, route, handler, controller
- `endpoint` → route, handler, api, controller
- `request` → request, req, http, handler
- `response` → response, res, http, result

### ✉️ Messaging & Notifications
- `message` → message, msg, send, notify, email
- `notification` → notify, notification, alert, push
- `email` → email, mail, send, smtp

### 🏗 Architecture & Patterns
- `service` → service, business, logic, handler
- `controller` → controller, handler, endpoint, route
- `model` → model, entity, schema, data
- `repository` → repository, dao, store, data
- `middleware` → middleware, interceptor, filter, handler

### 🔄 Iteration & Control Flow
- `loop` → loop, round, iterate, iteration, while, for, stream, async
- `iteration` → iterate, round, loop, max_rounds, cycle
- `rounds` → round, max_rounds, iteration, loop, cycle

### 🔍 Search & Discovery
- `search` → search, find, query, lookup, hybrid, bm25, vector
- `discovery` → discover, find, explore, analyze, scan
- `explore` → explore, discover, analyze, scan, map
- `vector` → vector, embedding, embed, chromadb, semantic
- `hybrid` → hybrid, search, bm25, vector, fuse, combine

### 🛠 Tools & Infrastructure
- `prefetch` → prefetch, preload, agent, stream, discover, analyze, round
- `agent` → agent, worker, processor, handler, stream, async
- `llm` → llm, model, ai, gpt, claude, deepseek, openai
- `rag` → rag, retrieval, augmented, context, vector

## How to Use
When a user asks a question, "rewrite" their query by picking 2-3 technical keywords from these mappings to use with `grep_search` or `glob`.
