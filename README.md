# 🧪 TabbleLab

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![Postman Collection](https://img.shields.io/badge/Postman-Collection-orange?logo=postman&logoColor=white)](./postman/collections/TabbleLab%20API.postman_collection.json)
[![Node.js](https://img.shields.io/badge/Node.js-20%2B-green?logo=node.js&logoColor=white)](https://nodejs.org/)
[![pnpm](https://img.shields.io/badge/pnpm-Workspace-orange?logo=pnpm&logoColor=white)](https://pnpm.io/)
[![Docker Ready](https://img.shields.io/badge/Docker-Ready-blue?logo=docker&logoColor=white)](#-quick-start-docker)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supported-blue?logo=postgresql&logoColor=white)](#-features-v01---mvp)
[![Open Source](https://img.shields.io/badge/Open%20Source-Yes-brightgreen)](#-license)
[![GitHub Issues](https://img.shields.io/github/issues/balkacer/tabblelab)](https://github.com/balkacer/tabblelab/issues)
[![GitHub Pull Requests](https://img.shields.io/github/issues-pr/balkacer/tabblelab)](https://github.com/balkacer/tabblelab/pulls)

> The open-source SQL lab for modern developers.

TabbleLab is a self-hosted, web-based database manager designed to explore, query and understand your databases through a clean, minimal and modern interface — without installing heavy desktop clients.

Built for developers who want speed, clarity and control.

---

## ✨ Features (v0.1 - MVP)

- 🔌 PostgreSQL support (MySQL & MSSQL coming soon)
- 🧠 Modern SQL editor powered by Monaco
- 📂 Schema explorer (tables, columns, indexes)
- 📊 Result grid with pagination
- ⏱ Query timeout protection
- 📏 Automatic row limit
- 🛑 Cancel running queries
- 🌙 Dark mode by default
- 🐳 Docker support

---

## 🚀 Why TabbleLab?

Traditional database tools are:

- Heavy
- Local-only
- Not collaborative
- Visually outdated

TabbleLab is:

- 🌍 Web-based
- 🪶 Lightweight
- 🔐 Secure by design
- 🧩 Extensible
- 🧪 Built as a modular SQL laboratory

---

## 🔒 Security First

TabbleLab is designed with safety in mind:

- Configurable query timeout
- Configurable row limits
- Optional Safe Mode (blocks destructive statements)
- Controlled connection pooling
- Self-hosted by default — you own your data

⚠️ TabbleLab does **not** store database credentials in plain text.

---

## 🏗 Architecture

TabbleLab follows a modular architecture:

```
├── apps/
│   ├── web/        → Frontend (React + TypeScript)
│   └── api/        → Backend (NestJS)
└── packages/
    ├── database-core/  → Driver abstraction layer
    ├── ui/             → Shared UI components
    └── types/          → Shared types
```

The database engine is built around a driver interface, allowing easy support for additional databases.

Currently supported:

- PostgreSQL

Planned:

- MySQL
- MSSQL
- SQLite
- Community drivers

---

## 🐳 Quick Start (Docker)

```bash
git clone https://github.com/your-username/tabblelab.git
cd tabblelab
pnpm docker
```

Then in the browser, open:

```bash
http://localhost:5173
```

## Run Locally

**Install**

```bash
pnpm install
```

**Run API**

```bash
pnpm dev:api
```

**Run Web**

```bash
pnpm dev:web
```

## 🛠 Development

**Requirements**

- Node.js 20+
- pnpm
- Docker (optional)

## 🧪 API Testing (Postman)

TabbleLab includes a ready-to-use Postman collection for local development.

You can find it here: [TabbleLab Postman Collection](./postman/collections/TabbleLab%20API.postman_collection.json)

### How to use

1. Import the collection into Postman.
2. Set the collection variables:
   - `baseURL` → `http://0.0.0.0:4000`
   - `connectionId` → `1`
   - `dbPassword` → `postgres`
   - `dbHost` → `db`
   - `dbName` → `tabblelab`
   - `dbUser` → `postgres`
   - `dbPort` → `5432`
   - `queryId` → `1`
   - `testEmail` → `test@tabblelab3.com`
   - `testPassword` → `12345678`
   - `profileConnectionId` → `1`
3. Run:
   - Create Connection
   - List Tables
   - Run Query
   - Delete Connection

This collection is intended for local development and backend validation.

## 🗺 Roadmap

### v0.1

- PostgreSQL support
- SQL editor
- Schema explorer
- Query execution

### v0.2

- MySQL & MSSQL
- Saved queries
- Multi-connection management

### v0.3

- Roles & permissions
- Query insights
- Execution plan visualizer

## 🤝 Contributing

We welcome contributions from developers of all levels.

You can help with:

- Database drivers
- UI improvements
- Performance optimizations
- Security enhancements
- Documentation
- Testing

Please read [CONTRIBUTING.md](./CONTRIBUTING.md) before submitting a PR.

## 📜 License

MIT License.

## 🌍 Vision

TabbleLab aims to become the open-source standard for web-based SQL management.

Not just a database client —
but a laboratory for exploring and understanding data.

## ⭐ Support the Project

If you find TabbleLab useful:

- ⭐ Star the repository
- 🐛 Report issues
- 🧠 Suggest improvements
- 🤝 Contribute

Built with ❤️ for developers.
