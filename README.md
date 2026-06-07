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

---

> Desenvolvido por João Victor Gomes Thomazini e Victor Feitoza Lulio.
