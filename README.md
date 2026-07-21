<h1 align="center">💈 Barbearia Navalha de Ouro</h1>

<p align="center">
  Sistema completo de <strong>agendamento de serviços</strong> para barbearia, com área pública para clientes e painel administrativo protegido por login.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/Node.js-20-339933?style=for-the-badge&logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/Express-4-000000?style=for-the-badge&logo=express&logoColor=white" />
  <img src="https://img.shields.io/badge/MongoDB-7-47A248?style=for-the-badge&logo=mongodb&logoColor=white" />
  <img src="https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white" />
  <img src="https://img.shields.io/badge/Vite-5-646CFF?style=for-the-badge&logo=vite&logoColor=white" />
</p>

---

## 🔗 Links

| | |
|---|---|
| 🌐 **Aplicação em produção** | _adicione aqui o link do deploy (Vercel)_ |
| 💻 **Repositório** | _adicione aqui o link deste repositório_ |

---

## 📋 Sobre o projeto

Aplicação web (stack **MERN**) para uma barbearia gerenciar seus agendamentos.
O sistema é dividido em duas áreas totalmente separadas:

- **👤 Área do Cliente (pública):** o cliente escolhe o barbeiro, o serviço, a data e um horário livre, e recebe a confirmação do agendamento.
- **👨‍💼 Área Administrativa (protegida por login):** o barbeiro acompanha a agenda, controla o status dos atendimentos, gerencia o caixa e os pedidos da loja.

---

## ✨ Funcionalidades

### 👤 Área do Cliente
- 📅 Agendamento informando **nome, telefone, serviço, data e horário**
- 💈 Escolha entre **dois barbeiros**, cada um com sua própria agenda
- 🕐 Consulta de **horários disponíveis** em tempo real
- 🚫 **Bloqueio de horários já ocupados** (impedido no front e validado no back)
- ✅ **Tela de confirmação** após o agendamento
- 🛍️ **Loja de produtos** com carrinho (retirada e pagamento presencial)
- 🖼️ Landing page com galeria de trabalhos, história e mapa de localização

### 👨‍💼 Área Administrativa
- 📖 Listagem de **todos os agendamentos** com dados dos clientes
- 🔍 **Filtro por data** e por barbeiro
- 🔄 Alteração de **status** (Agendado, Confirmado, Concluído, Cancelado)
- 🗑️ **Cancelar ou excluir** agendamentos
- 🔒 **Travar horários** (bloqueio de agenda do barbeiro)
- 💰 **Caixa** com dashboard: total, ticket médio e gráficos por forma de pagamento e por dia
- 📦 Gestão de **pedidos da loja**

---

## 🛠️ Tecnologias utilizadas

**Frontend**
- React 18 + Vite
- React Router DOM
- Axios
- Recharts (gráficos do dashboard)
- CSS puro (responsivo, mobile-first)

**Backend**
- Node.js + Express
- MongoDB + Mongoose
- express-validator (validação)
- JSON Web Token (autenticação)
- bcryptjs (hash de senha)

**Infraestrutura**
- Docker + Docker Compose
- Nginx (serve o build do front em produção)

---

## 🤖 Uso de Inteligência Artificial

Ferramentas de IA foram usadas de forma pontual, como apoio ao desenvolvimento — principalmente para tirar dúvidas específicas, revisar trechos de código e agilizar a escrita de partes repetitivas da documentação. A arquitetura, as decisões técnicas e a implementação foram conduzidas e validadas manualmente.

---

## 🚀 Como executar localmente

### 🐳 Opção A — Com Docker (recomendado)

> Requisitos: [Docker](https://www.docker.com/products/docker-desktop/) e Docker Compose instalados.

```bash
# 1. Clone o repositório
git clone https://github.com/SEU_USUARIO/barbearia.git
cd barbearia

# 2. Crie o arquivo .env a partir do exemplo
cp .env.example .env      # no Windows: copy .env.example .env

# 3. Suba os containers
docker compose up --build
```

Acesse:
- 🌐 **Cliente:** http://localhost:8080
- 🔐 **Admin:** http://localhost:8080/admin/login
- ⚙️ **API:** http://localhost:5000/api/health

> Para popular dados de exemplo (opcional):
> ```bash
> docker compose exec server npm run seed
> ```

---

### 💻 Opção B — Sem Docker (manual)

> Requisitos: Node.js 20+ e MongoDB (local ou MongoDB Atlas).

**Backend:**
```bash
cd server
cp .env.example .env      # ajuste MONGO_URI e JWT_SECRET
npm install
npm run dev               # http://localhost:5000
```

**Frontend (em outro terminal):**
```bash
cd client
cp .env.example .env      # VITE_API_URL=http://localhost:5000/api
npm install
npm run dev               # http://localhost:5173
```

---

## 🔑 Credenciais de acesso (admin)

| Campo | Valor |
|---|---|
| **Usuário** | `barbeiro` |
| **Senha** | `barbearia123` |

Login em `/admin/login`. Em produção, altere `ADMIN_USER` e `ADMIN_PASS` no `.env`.

---

## 🧠 Decisões técnicas

- **Organização em camadas** — o back-end segue `routes → middleware → controllers → models`, mantendo cada arquivo com responsabilidade única.

- **Regra anti-duplicidade (crítica)** — proteção em duas camadas: verificação explícita no controller **e** índice único parcial no MongoDB sobre `{ barbeiro, data, horario }`. Em concorrência (dois clientes no mesmo horário), o segundo recebe **HTTP 409**. O índice ignora cancelados, permitindo reagendar horários liberados.

- **Agenda por barbeiro** — cada barbeiro tem sua própria agenda; o mesmo horário pode estar livre para um e ocupado para o outro.

- **Validação em dupla camada** — o front valida para experiência imediata, mas **toda entrada é revalidada no back-end** com express-validator.

- **Autenticação JWT** — token assinado no login, armazenado no cliente e injetado via interceptor do Axios; middleware protege todas as rotas administrativas. Senha do admin em hash bcrypt.

- **Segurança de preços na loja** — o total do pedido é **recalculado no servidor** a partir do catálogo, ignorando valores enviados pelo cliente.

- **Responsividade mobile-first** — no painel admin, tabelas viram cards empilhados em telas pequenas.

---

## 📂 Estrutura do projeto
