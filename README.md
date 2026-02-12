# 🧪 TabbleLab

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

## 🗺 Roadmap

**v0.1**
- PostgreSQL support
- SQL editor
- Schema explorer
- Query execution

**v0.2**
- MySQL & MSSQL
- Saved queries
- Multi-connection management

**v0.3**
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
