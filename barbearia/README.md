# 💈 Sistema de Agendamento — Barbearia

Aplicação web full-stack (MERN) para agendamento de serviços de barbearia, com
área pública para clientes e painel administrativo protegido por autenticação JWT.

---

## 🧩 Tecnologias utilizadas

**Frontend**
- React 18 + Vite
- React Router DOM (rotas SPA)
- Axios (chamadas HTTP com interceptors)
- CSS puro (responsivo, mobile-first)

**Backend**
- Node.js + Express
- MongoDB + Mongoose
- express-validator (validação de entrada)
- JSON Web Token (autenticação admin)
- bcryptjs (hash de senha)

**Infraestrutura**
- Docker + Docker Compose (orquestra front, back e banco)
- Nginx (serve o build do front em produção)

---

## 🤖 Ferramentas de IA usadas no desenvolvimento

Este projeto foi desenvolvido com o apoio do **Claude (Anthropic)**, utilizado para:
- Arquitetura de pastas e organização em camadas
- Geração e revisão do código de back e front
- Definição da regra de negócio anti-duplicidade (índice único parcial + tratamento de 409)
- Escrita da documentação e instruções de deploy

Todo o código foi revisado, testado e validado etapa por etapa antes da integração.

---

## 📂 Estrutura do projeto

```
barbearia/
├── docker-compose.yml
├── .env.example
├── server/                 # API Express
│   └── src/
│       ├── config/         # conexão MongoDB
│       ├── models/         # Mongoose (Agendamento, Admin)
│       ├── controllers/    # lógica de negócio
│       ├── routes/         # definição de endpoints
│       ├── middleware/     # auth JWT + validação
│       ├── validators/     # regras express-validator
│       ├── utils/          # geração de slots + catálogo de serviços
│       └── seed.js         # popular agendamentos de exemplo (opcional)
└── client/                 # SPA React + Vite
    └── src/
        ├── api/            # instância axios
        ├── context/        # AuthContext (JWT)
        ├── components/     # Navbar, ProtectedRoute, StatusBadge
        └── pages/          # Cliente, Confirmação, Login, Admin
```

---

## 🔑 Credenciais de acesso do admin (teste)

O admin é criado automaticamente no primeiro start, a partir das variáveis de ambiente:

```
Usuário: barbeiro
Senha:   barbearia123
```

> ⚠️ Em produção, altere `ADMIN_USER` e `ADMIN_PASS` no `.env` para valores seguros.
> O login fica disponível em `/admin/login`.

---

## 🚀 Rodando localmente

### Opção A — Com Docker (recomendado)

Requisitos: Docker e Docker Compose instalados.

1. Clone o repositório:
   ```bash
   git clone https://github.com/SEU_USUARIO/barbearia.git
   cd barbearia
   ```

2. Crie o arquivo `.env` na raiz (baseado no `.env.example`):
   ```bash
   cp .env.example .env
   ```
   Ajuste os valores conforme necessário.

3. Suba os containers:
   ```bash
   docker compose up --build
   ```

4. Acesse:
   - **Cliente:** http://localhost:8080
   - **Admin:**   http://localhost:8080/admin/login
   - **API:**     http://localhost:5000/api/health

Para parar: `docker compose down` (adicione `-v` para apagar o volume do banco).

---

### Opção B — Sem Docker (manual)

Requisitos: Node.js 20+, MongoDB rodando localmente (ou MongoDB Atlas).

**Backend:**
```bash
cd server
cp .env.example .env        # ajuste MONGO_URI, JWT_SECRET, etc.
npm install
npm run dev                 # sobe em http://localhost:5000
```

(Opcional) popular agendamentos de exemplo:
```bash
npm run seed
```

**Frontend** (em outro terminal):
```bash
cd client
cp .env.example .env        # VITE_API_URL=http://localhost:5000/api
npm install
npm run dev                 # sobe em http://localhost:5173
```

Acesse o cliente em http://localhost:5173 e o admin em http://localhost:5173/admin/login.

---

## 🧠 Decisões técnicas adotadas

### Organização em camadas
O backend segue a separação **routes → middleware → controllers → models**, o que
mantém cada arquivo com responsabilidade única e facilita testes e manutenção.
As validações ficam isoladas em `validators/` e são plugadas nas rotas.

### Loja de produtos com carrinho
A loja (rota `/loja`) lista produtos definidos em `server/src/utils/produtos.js`. O carrinho
é um estado global no front (Context API), com adicionar, remover e ajustar quantidade. Ao
finalizar, o pedido vai para o backend — que **recalcula o total a partir do catálogo do
servidor**, ignorando qualquer preço enviado pelo cliente (proteção contra manipulação). Os
pedidos aparecem na aba **Pedidos** do admin, com controle de status (Novo, Separado, Entregue,
Cancelado).

### Dashboard do caixa
A aba Caixa usa a biblioteca Recharts para exibir um gráfico de pizza (recebimentos por forma
de pagamento) e um gráfico de barras (faturamento por dia), além de cards com ícones para total,
número de atendimentos e ticket médio — tudo respeitando a paleta escura/dourada.

### Dois barbeiros e agenda independente
O sistema trabalha com dois barbeiros (definidos em `server/src/utils/barbeiros.js`).
Cada um tem a própria agenda: o mesmo horário pode estar livre para um e ocupado para
o outro. Por isso a chave de unicidade passou a ser `{ barbeiro, data, horario }`, e a
consulta de disponibilidade exige informar o barbeiro. No formulário público o cliente
escolhe o barbeiro antes de ver os horários livres daquele profissional.

### Travar horário (bloqueio)
No painel, o barbeiro pode travar um horário em que não vai atender (almoço, compromisso).
Isso cria um registro do tipo `bloqueio`, que ocupa o slot como se fosse um agendamento —
some da lista de horários livres do cliente — mas aparece separado no admin, podendo ser
liberado a qualquer momento.

### Caixa e formas de pagamento
Ao concluir um atendimento, o admin registra a forma de pagamento (Pix, cartão de crédito,
cartão de débito ou dinheiro) e o valor recebido. A aba **Caixa** soma esses valores por
período e por barbeiro, mostrando total, número de atendimentos, ticket médio e a quebra
por forma de pagamento. Se um atendimento sair do status "Concluído", seu valor deixa de
contar no caixa automaticamente.

### Clientes a atender x já atendidos
A agenda do admin separa em duas listas: **A atender** (status Agendado ou Confirmado) e
**Já atendidos** (Concluído), com contadores. Filtros por data e por barbeiro se aplicam
às duas.

### Regra anti-duplicidade (crítica)
Para garantir que dois clientes não agendem o mesmo horário, a proteção é feita em
**duas camadas**:
1. **Verificação explícita** no controller antes de inserir (mensagem amigável);
2. **Índice único parcial** no MongoDB sobre `{ data, horario }`, ignorando registros
   cancelados. Em condição de corrida (dois inserts simultâneos), o segundo dispara
   o erro `11000`, tratado como **HTTP 409 (Conflito)**.

O filtro parcial (`status != Cancelado`) permite reagendar um horário que foi liberado
por cancelamento, sem violar o índice.

### Catálogo de serviços centralizado
Os serviços da barbearia (nome, duração e preço) ficam em `server/src/utils/servicos.js`
como fonte única da verdade. O front consome via endpoint `GET /api/agendamentos/servicos`
e o back valida cada agendamento contra essa mesma lista — o cliente nunca consegue
enviar um serviço inexistente, mesmo manipulando a requisição.

### Slots de horário
Gerados dinamicamente em `utils/slots.js` (08:00 às 18:00, slots de 1h → últimos
atendimentos iniciam às 17:00). A rota de disponibilidade retorna apenas os slots
livres; o front bloqueia visualmente os ocupados e o back revalida na criação.

### Validação em dupla camada
Nunca confiando só no front: o cliente valida para UX imediata, mas **toda entrada é
revalidada no backend** com express-validator (formato de data, telefone, serviço e
slot válidos, status permitido). Erros 400 do back são mapeados de volta para os
campos no front.

### Autenticação
Login gera um **JWT** assinado com `JWT_SECRET`. O token é guardado no `localStorage`
e injetado via interceptor do axios. O middleware `auth` protege todas as rotas
administrativas; um interceptor de resposta desloga o usuário automaticamente em 401.
A senha do admin é armazenada com **hash bcrypt** (nunca em texto puro).

### Segurança de credenciais
Nenhuma credencial fica hardcoded: `JWT_SECRET`, URI do banco e credenciais do admin
vêm todas de variáveis de ambiente (`.env`), fora do controle de versão (`.gitignore`).

### Identidade visual (landing page)
A área do cliente é uma landing page inspirada em barbearias clássicas: hero com
fotografia em tela cheia (banco de imagens gratuito Unsplash), paleta escura com
dourado de destaque, tipografia com fonte serif de display (Playfair Display) e
condensada (Barlow Condensed). A seção de serviços exibe cards com ícones que, ao
serem clicados, já selecionam o serviço e rolam suavemente até o formulário de
agendamento. O hero tem cor de fundo de fallback, então nunca fica quebrado caso a
imagem externa não carregue.

### Responsividade
CSS mobile-first: hero e seções se adaptam a telas pequenas, e no painel admin a
tabela de agendamentos se transforma em cards empilhados abaixo de 640px, garantindo
boa leitura no celular.

---

## ☁️ Deploy gratuito (produção)

Arquitetura: **serviço único no Render** (o backend serve o front-end já compilado) + **MongoDB Atlas** (banco). Só dois cadastros, ambos gratuitos.

### 1. Banco — MongoDB Atlas
1. Crie conta em https://www.mongodb.com/atlas e um cluster gratuito (M0).
2. Em **Database Access**, crie um usuário e senha.
3. Em **Network Access**, libere `0.0.0.0/0`.
4. Copie a **connection string** (ex.: `mongodb+srv://usuario:senha@cluster.xxxxx.mongodb.net/barbearia`).

### 2. Aplicação — Render
1. Suba este repositório no GitHub.
2. Crie conta em https://render.com e conecte o GitHub.
3. **New → Web Service** e selecione o repositório. O Render detecta o arquivo `render.yaml` automaticamente. Se preferir configurar manual:
   - **Root Directory:** `server`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
4. Em **Environment**, adicione a variável:
   ```
   MONGO_URI = (a connection string do Atlas)
   ```
   As demais (`JWT_SECRET`, `ADMIN_USER`, `ADMIN_PASS`, `JWT_EXPIRES_IN`) já vêm no `render.yaml`.
5. Deploy. O Render compila o front, o backend passa a servi-lo, e você recebe **um único link público** (ex.: `https://barbearia.onrender.com`).

> Como o front é servido pelo próprio backend, o cliente e o admin ficam no mesmo domínio:
> - Cliente: `https://SEU-APP.onrender.com`
> - Admin: `https://SEU-APP.onrender.com/admin/login`

> **Nota:** o plano gratuito do Render hiberna após ~15 min de inatividade. A primeira
> visita depois disso leva ~40 segundos para "acordar" o serviço; depois fica normal.

## 📋 Endpoints da API

| Método | Rota                                      | Acesso  | Descrição                          |
|--------|-------------------------------------------|---------|------------------------------------|
| GET    | `/api/health`                             | Público | Health check                       |
| GET    | `/api/agendamentos/servicos`              | Público | Catálogo de serviços da barbearia  |
| GET    | `/api/agendamentos/barbeiros`             | Público | Lista de barbeiros                 |
| GET    | `/api/produtos`                           | Público | Catálogo de produtos da loja       |
| POST   | `/api/pedidos`                            | Público | Cria pedido (preços validados no back) |
| GET    | `/api/pedidos?status=`                    | Admin   | Lista pedidos da loja              |
| PATCH  | `/api/pedidos/:id/status`                 | Admin   | Altera status do pedido            |
| DELETE | `/api/pedidos/:id`                        | Admin   | Exclui pedido                      |
| GET    | `/api/agendamentos/disponibilidade?data=&barbeiro=` | Público | Slots livres de um barbeiro numa data |
| POST   | `/api/agendamentos`                       | Público | Cria agendamento (409 se ocupado)  |
| POST   | `/api/auth/login`                         | Público | Login do admin (retorna JWT)       |
| GET    | `/api/agendamentos?data=`                 | Admin   | Lista (filtro opcional por data)   |
| GET    | `/api/agendamentos/:id`                   | Admin   | Detalhe de um agendamento          |
| PATCH  | `/api/agendamentos/:id/status`            | Admin   | Altera status                      |
| POST   | `/api/agendamentos/bloqueio`              | Admin   | Trava um horário de um barbeiro    |
| PATCH  | `/api/agendamentos/:id/status`            | Admin   | Altera status (+ pagamento ao concluir) |
| GET    | `/api/agendamentos/caixa?de=&ate=&barbeiro=` | Admin | Totais do caixa por forma e período |
| DELETE | `/api/agendamentos/:id`                   | Admin   | Exclui agendamento ou libera bloqueio |

---

## 📄 Licença

Projeto desenvolvido para avaliação técnica. Uso livre para fins de estudo.
