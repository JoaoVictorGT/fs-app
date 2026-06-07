# Studio Fitness

**Studio Fitness** é o nome da academia e também o nome deste sistema — uma plataforma desenvolvida para conectar professores e alunos dentro da academia, centralizando o agendamento de aulas de forma simples e eficiente.

## Sobre o projeto

O sistema funciona em torno da relação entre dois perfis de usuário: **professores** e **alunos**.

O professor cadastra seus horários disponíveis na academia, definindo data, horário, tipo de aula e capacidade máxima de alunos por slot. O aluno visualiza esses horários e realiza o agendamento diretamente pela plataforma. Cancelamentos são permitidos com até 24 horas de antecedência.

Há dois tipos de aluno: o **personal**, vinculado diretamente a um professor específico e cadastrado por ele; e o **aluno de grupo**, que se registra de forma autônoma e escolhe o professor livremente.

O sistema conta ainda com um **pontuador semanal de treinos** — inspirado no modelo do Duolingo — que registra automaticamente as semanas consecutivas em que o aluno compareceu a pelo menos uma aula, promovendo consistência e engajamento.

## Stack

- **Frontend:** React 18 + TypeScript + Vite
- **Backend:** Node.js + Express + TypeScript
- **Banco de dados:** Firebase Firestore
- **Autenticação:** Firebase Authentication (e-mail e senha)
- **Infraestrutura:** Docker

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
---

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
---

> Desenvolvido por João Victor Gomes Thomazini e Victor Feitoza Lulio.
