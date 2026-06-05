# Studio Fitness — Sistema de Agendamento de Aulas

Sistema web para academias que conecta professores e alunos. Professores gerenciam seus horários e alunos fazem agendamentos com cancelamento até 24h antes.

## Stack

- **Frontend:** React 18 + TypeScript + Vite
- **Backend:** Node.js + Express + TypeScript
- **Banco:** Firebase Firestore (camada preparada — conecte quando tiver credenciais)
- **Auth:** JWT (mock) → Firebase Auth (futuro)
- **Email:** Nodemailer (configure SMTP para ativar)
- **Infra:** Docker + Docker Compose

## Rodar localmente (sem Docker)

### Backend

```bash
cd backend
cp .env.example .env    # edite as variáveis se quiser
npm install
npm run dev             # inicia em http://localhost:4000
```

### Frontend

```bash
cd frontend
npm install
npm run dev             # inicia em http://localhost:3000
```

Acesse http://localhost:3000

## Rodar com Docker

```bash
docker-compose up --build
```

Para ativar o Firebase Emulator:

```bash
docker-compose --profile emulator up
```

## Credenciais de demonstração

| Perfil         | E-mail                       | Senha       |
|----------------|------------------------------|-------------|
| Professor      | maria@studiofitness.com      | teacher123  |
| Professor 2    | rafael@studiofitness.com     | teacher123  |
| Aluno personal | joao@email.com               | student123  |
| Aluno personal | ana@email.com                | student123  |
| Aluno grupo    | carlos@email.com             | student123  |

## Endpoints principais

```
POST   /api/auth/login
GET    /api/auth/me

GET    /api/teachers
GET    /api/teachers/:id

POST   /api/students/register
GET    /api/students/:id
GET    /api/students/by-teacher/:teacherId

GET    /api/slots?teacherId=&date=
POST   /api/slots
PATCH  /api/slots/:id
PATCH  /api/slots/:id/cancel
DELETE /api/slots/:id

GET    /api/bookings/my
GET    /api/bookings/by-teacher
POST   /api/bookings
DELETE /api/bookings/:id
```

## Integrar Firebase

1. Crie um projeto no [Firebase Console](https://console.firebase.google.com)
2. Ative Firestore e Authentication (e-mail/senha)
3. Gere uma Service Account key
4. Preencha as variáveis no `backend/.env`:
   ```
   FIREBASE_PROJECT_ID=seu-projeto
   FIREBASE_CLIENT_EMAIL=...
   FIREBASE_PRIVATE_KEY=...
   ```
5. Implemente `FirestoreTeacherRepository`, `FirestoreSlotRepository`, etc., seguindo a interface `IRepository` em `backend/src/repositories/interfaces.ts`
6. Substitua as importações nos services correspondentes

## Ativar envio de e-mails

Preencha no `backend/.env`:

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu@gmail.com
SMTP_PASS=sua-app-password
```

Para Gmail, use [App Passwords](https://support.google.com/accounts/answer/185833).
