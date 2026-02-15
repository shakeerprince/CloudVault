<p align="center">
  <img src="https://img.icons8.com/fluency/96/cloud-storage.png" alt="CloudVault Logo" width="80"/>
</p>

<h1 align="center">CloudVault</h1>

<p align="center">
  <strong>A modern, production-ready file upload dashboard with secure authentication and cloud storage.</strong>
</p>

<p align="center">
  <a href="https://nextjs.org"><img src="https://img.shields.io/badge/Next.js-16-black?logo=next.js" alt="Next.js"/></a>
  <a href="https://www.mongodb.com"><img src="https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb" alt="MongoDB"/></a>
  <a href="https://www.digitalocean.com/products/spaces"><img src="https://img.shields.io/badge/DigitalOcean-Spaces-0080FF?logo=digitalocean" alt="DO Spaces"/></a>
  <a href="https://vercel.com"><img src="https://img.shields.io/badge/Deploy-Vercel-000?logo=vercel" alt="Vercel"/></a>
</p>

---

## ✨ Features

- **🔐 JWT Authentication** — Secure login & signup with bcryptjs hashing and HTTP-only cookie sessions
- **☁️ Cloud File Storage** — Upload files directly to DigitalOcean Spaces (S3-compatible) with server-side processing
- **📊 Dashboard** — Real-time stats overview with animated cards showing file counts, storage usage, and recent activity
- **📁 File Manager** — Grid/list views, search by filename, filter by type (images, PDFs, videos), pagination
- **🗑️ File Management** — Delete files with confirmation modal (removes from both S3 and database)
- **📋 Copy & Share** — One-click copy public file URLs to clipboard
- **🎨 Premium Dark UI** — Cinematic dark theme with glassmorphism, gradient accents, and GSAP animations
- **📱 Responsive Design** — Works seamlessly on desktop, tablet, and mobile

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 16 (App Router + Turbopack) |
| **Frontend** | React 19, GSAP, react-dropzone |
| **Auth** | JWT (jose) + bcryptjs |
| **Database** | MongoDB (Prisma ORM) |
| **File Storage** | AWS S3 SDK → DigitalOcean Spaces |
| **Styling** | Custom CSS (dark theme + glassmorphism) |
| **Deployment** | Vercel |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- MongoDB Atlas account (free tier works) or Docker for local MongoDB
- DigitalOcean Spaces bucket (or any S3-compatible storage)

### 1. Clone & Install

```bash
git clone https://github.com/shakeerprince/CloudVault.git
cd CloudVault
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```env
DATABASE_URL="mongodb+srv://user:password@cluster.mongodb.net/CloudVault?retryWrites=true&w=majority"
JWT_SECRET="your-secret-key"
AWS_S3_ACCESS_KEY=your-access-key
AWS_S3_SECRET_KEY=your-secret-key
AWS_S3_REGION=blr1
AWS_S3_BUCKET_NAME=your-bucket
AWS_S3_BUCKET_URL=https://your-bucket.blr1.digitaloceanspaces.com
AWS_S3_ENDPOINT=https://blr1.digitaloceanspaces.com
```

### 3. Generate Prisma Client

```bash
npx prisma generate
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) → Sign up → Start uploading!

### Local MongoDB (Optional)

If you prefer a local database instead of Atlas:

```bash
docker-compose up -d   # Starts MongoDB 6 with replica set
```

Update `.env`:
```env
DATABASE_URL="mongodb://localhost:27017/CloudVault?replicaSet=rs0"
```

---

## 📁 Project Structure

```
CloudVault/
├── prisma/
│   └── schema.prisma          # Database models (users, uploaded_files)
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/           # Login, Register, Logout, Me endpoints
│   │   │   ├── files/          # List files, Delete file
│   │   │   └── upload/         # Server-side S3 upload
│   │   ├── dashboard/
│   │   │   ├── layout.js       # Sidebar + header layout
│   │   │   ├── page.js         # Overview with stats
│   │   │   ├── upload/         # Drag-and-drop upload page
│   │   │   └── files/          # File manager (grid/list)
│   │   ├── login/              # Login page
│   │   ├── signup/             # Signup page
│   │   └── globals.css         # Design system
│   ├── context/
│   │   └── AuthContext.js      # Auth state management
│   ├── lib/
│   │   ├── jwt.js              # Token generation & verification
│   │   ├── prisma.js           # Database client
│   │   └── s3.js               # S3 utilities
│   └── middleware.js           # Route protection
├── docker-compose.yml          # Local MongoDB setup
└── .env.example                # Environment template
```

---

## 🌐 Deploy to Vercel

1. Push your code to GitHub
2. Import the repo on [Vercel](https://vercel.com/new)
3. Add all environment variables from `.env.example`
4. Ensure MongoDB Atlas **Network Access** allows `0.0.0.0/0`
5. Deploy! 🎉

---

## 📄 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Create new account |
| `POST` | `/api/auth/login` | Login with credentials |
| `POST` | `/api/auth/logout` | Clear session |
| `GET` | `/api/auth/me` | Get current user |
| `POST` | `/api/upload` | Upload file to S3 |
| `GET` | `/api/files` | List user's files |
| `DELETE` | `/api/files/[id]` | Delete a file |

---

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

---

<p align="center">
  Built with ❤️ by <a href="https://github.com/shakeerprince">shakeerprince</a>
</p>
