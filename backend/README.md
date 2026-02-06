# Formalize Backend

Team/Organization Mode API for Formalize.

## Setup

### 1. Install dependencies
```bash
cd backend
npm install
```

### 2. Configure database
Edit `.env` with your PostgreSQL connection:
```
DATABASE_URL="postgresql://user:password@localhost:5432/formalize"
JWT_SECRET="your-secret-key"
```

### 3. Run migrations
```bash
npm run db:push
```

### 4. Start server
```bash
npm run dev    # Development (with hot reload)
npm start      # Production
```

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/me` | Get current user |

### Organization
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/org` | Create organization |
| GET | `/api/org` | Get org details + members |
| POST | `/api/org/invite` | Invite member |
| POST | `/api/org/join` | Join via invite token |
| PATCH | `/api/org/members/:id/role` | Update member role |
| DELETE | `/api/org/members/:id` | Remove member |

### Slangs
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/slangs` | Get all slangs (personal + org) |
| GET | `/api/slangs/prompt` | Get slangs formatted for AI |
| POST | `/api/slangs/personal` | Add personal slang |
| DELETE | `/api/slangs/personal/:id` | Delete personal slang |
| GET | `/api/slangs/org` | Get org slangs |
| POST | `/api/slangs/org` | Add org slang (admin) |
| PATCH | `/api/slangs/org/:id/approve` | Approve slang (admin) |
| DELETE | `/api/slangs/org/:id` | Delete org slang (admin) |

### Templates
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/templates` | Get all templates |
| POST | `/api/templates` | Create template (admin) |
| PATCH | `/api/templates/:id` | Update template (admin) |
| DELETE | `/api/templates/:id` | Delete template (admin) |

## Database Commands
```bash
npm run db:migrate  # Create migrations
npm run db:push     # Push schema (dev)
npm run db:studio   # Open Prisma Studio
```
