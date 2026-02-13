# 🧪 TabbleLab

[![Postman Collection](https://img.shields.io/badge/Postman-Collection-orange?logo=postman&logoColor=white)](https://altarlink.postman.co/workspace/CIAM~4d8cfcbb-286f-482d-9c66-f82a9b335d46/collection/30447307-b7ce3cd5-b426-4e84-a06b-816c604e072f?action=share&creator=30447307&active-environment=30447307-28dd5f85-c186-44cc-9971-868c0e9ab618)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
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
docker compose up
```

Then open:

```bash
http://localhost:3000
```

## 🛠 Development

**Requirements**

- Node.js 20+
- pnpm
- Docker (optional)

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

## 🧪 API Testing (Postman)

TabbleLab includes a ready-to-use Postman collection for local development.

You can find it here: [TabbleLab Postman Collection](https://altarlink.postman.co/workspace/CIAM~4d8cfcbb-286f-482d-9c66-f82a9b335d46/collection/30447307-b7ce3cd5-b426-4e84-a06b-816c604e072f?action=share&creator=30447307&active-environment=30447307-28dd5f85-c186-44cc-9971-868c0e9ab618)

### How to use

1. Import the collection into Postman.
2. Set the collection variables:
   - `baseUrl` → `http://localhost:4000`
   - `dbHost` → `localhost`
   - `dbPassword` → `your_db_password`
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
