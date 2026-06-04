# CLT ou PJ

Aplicacao para ajudar trabalhadores brasileiros a comparar propostas CLT e PJ sob o ponto de vista financeiro.

O objetivo e responder perguntas como:

- Tenho uma proposta CLT. Qual valor PJ deveria pedir para valer a pena?
- Tenho uma proposta CLT e uma proposta PJ. Qual compensa mais?
- Tenho uma proposta PJ. Qual seria um salario CLT equivalente?

A ferramenta permite calculos publicos sem login. Usuarios cadastrados podem salvar historico de simulacoes. Administradores terao acesso a dados agregados e listagens operacionais.

## Status do projeto

MVP inicial em desenvolvimento.

Ja existe:

- API REST em Go para calculos CLT x PJ.
- Cadastro, login, confirmacao de email e reset de senha.
- JWT para autenticacao.
- Persistencia via Supabase.
- Historico de calculos para usuarios autenticados.
- Frontend React com calculadora, cadastro, login, confirmacao de email, historico e dashboard admin inicial.
- Migration inicial do banco.

## Tecnologias

### Backend

- **Go**: linguagem principal da API.
- **Gin**: framework HTTP para rotas, middlewares e handlers REST.
- **JWT**: autenticacao de usuarios.
- **bcrypt**: hash seguro de senhas.
- **Supabase REST API**: persistencia em PostgreSQL gerenciado pelo Supabase.
- **SendGrid**: envio de email de confirmacao e recuperacao de senha.

### Frontend

- **React**
- **TypeScript**
- **Vite**
- **Tailwind CSS**
- **React Router**
- **TanStack Query**
- **Lucide React**
- **Recharts**

### Banco e infraestrutura

- **Supabase/PostgreSQL**
- **Supabase CLI**
- **Migrations SQL**

## Estrutura do projeto

```text
.
├── backend/
│   ├── cmd/api/                 # Entrada da API Go
│   └── internal/                # Modulos internos do backend
│       ├── auth/                # JWT, registro, login e reset de senha
│       ├── calculator/          # Regras de calculo CLT x PJ
│       ├── config/              # Leitura de ambiente
│       ├── httpapi/             # Handlers e middlewares HTTP
│       ├── mailer/              # Integracao SendGrid
│       ├── supabase/            # Cliente REST Supabase
│       └── users/               # Repositorio e modelos
├── docs/
│   └── proposta-mvp.md          # Proposta de produto, telas, entidades e backlog
├── frontend/
│   ├── src/
│   │   ├── lib/                 # Cliente da API
│   │   └── pages/               # Telas React
│   └── ...
├── supabase/
│   ├── config.toml              # Configuracao local da Supabase CLI
│   └── migrations/              # Migrations SQL
├── .env.example                 # Template de variaveis
└── README.md
```

## Pre-requisitos

- Node.js 20 ou superior
- npm
- Go instalado
- Conta/projeto Supabase
- SendGrid configurado com remetente verificado

No Windows, se o comando `go` nao estiver no `PATH`, use o caminho absoluto:

```powershell
& 'C:\Program Files\Go\bin\go.exe' version
```

## Como rodar localmente

### 1. Clonar o repositorio

```powershell
git clone https://github.com/ArthurMMaciel/clt-or-pj.git
cd clt-or-pj
```

### 2. Instalar dependencias da Supabase CLI local

Na raiz do projeto:

```powershell
npm.cmd install
```

Validar CLI:

```powershell
npx.cmd supabase --version
```

### 3. Instalar dependencias do frontend

```powershell
cd frontend
npm.cmd install
cd ..
```

### 4. Configurar variaveis de ambiente

Copie o template:

```powershell
Copy-Item .env.example .env
```

Preencha o `.env` com os dados reais:

```env
APP_ENV=local
PORT=8080
FRONTEND_URL=http://localhost:5173

SUPABASE_URL=
SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SECRET_KEY=

SENDGRID_API_KEY=
SENDGRID_FROM_EMAIL=
SENDGRID_FROM_NAME=CLT ou PJ

JWT_SECRET=
JWT_EXPIRES_IN_MINUTES=1440

EMAIL_CONFIRM_URL=http://localhost:5173/confirmar-email
PASSWORD_RESET_URL=http://localhost:5173/redefinir-senha
```

Importante: `.env` nao deve ser commitado.

### 5. Linkar Supabase e aplicar migrations

Faca login na Supabase CLI:

```powershell
npx.cmd supabase login
```

Linkar o projeto remoto:

```powershell
npx.cmd supabase link --project-ref zymvtqunqpmwberejjyt
```

Aplicar migrations:

```powershell
npx.cmd supabase db push
```

Tambem e possivel aplicar manualmente pelo SQL Editor do Supabase usando o arquivo:

```text
supabase/migrations/20260604133000_initial_auth_and_calculations.sql
```

### 6. Rodar o backend

```powershell
cd backend
$env:GOCACHE='C:\Projetos\clt-or-pj\backend\.gocache'
& 'C:\Program Files\Go\bin\go.exe' run ./cmd/api
```

API local:

```text
http://localhost:8080
```

Health check:

```text
GET http://localhost:8080/health
```

### 7. Rodar o frontend

Em outro terminal:

```powershell
cd frontend
npm.cmd run dev -- --host 127.0.0.1
```

Frontend local:

```text
http://127.0.0.1:5173
```

## Endpoints principais

### Publicos

```text
GET  /health
POST /api/v1/calculations/compare
POST /api/v1/calculations/clt-to-pj
POST /api/v1/calculations/pj-to-clt
POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/confirm-email
POST /api/v1/auth/request-password-reset
POST /api/v1/auth/reset-password
```

### Autenticados

```text
GET /api/v1/me
GET /api/v1/me/calculations
```

## Fluxo de autenticacao

1. Usuario cria conta com nome, email e senha.
2. Backend salva senha como hash bcrypt.
3. Backend gera token de confirmacao e envia email via SendGrid.
4. Usuario confirma email pelo link recebido.
5. Login libera JWT.
6. Requisicoes autenticadas usam:

```text
Authorization: Bearer <token>
```

O JWT carrega apenas dados de identificacao, como `user_id`, nome, email e role. A senha nunca entra no JWT.

## Modelo de calculo inicial

O MVP considera:

- salario bruto CLT;
- beneficios mensais;
- descontos mensais;
- bonus/PLR anual;
- FGTS;
- 13 salario;
- ferias + 1/3;
- valor mensal PJ;
- imposto efetivo estimado;
- contador;
- plano de saude;
- outros custos;
- reserva para ferias;
- reserva para 13 equivalente;
- reserva de emergencia.

O resultado inclui:

- liquido mensal estimado CLT;
- equivalente anual CLT;
- liquido mensal estimado PJ;
- equivalente anual PJ;
- diferenca mensal;
- diferenca anual;
- valor PJ minimo para empatar;
- recomendacao financeira;
- explicacoes do resultado.

## Telas atuais

- Calculadora publica CLT x PJ
- Cadastro
- Login
- Confirmacao de email
- Historico do usuario
- Dashboard admin inicial com graficos mockados

## Comandos de validacao

### Frontend

```powershell
cd frontend
npm.cmd run build
```

### Backend

```powershell
cd backend
$env:GOCACHE='C:\Projetos\clt-or-pj\backend\.gocache'
& 'C:\Program Files\Go\bin\go.exe' test ./...
& 'C:\Program Files\Go\bin\go.exe' build ./...
```

## Observacoes de seguranca

- Nao commitar `.env`.
- Rotacionar chaves expostas acidentalmente.
- Usar remetente verificado no SendGrid.
- Usar `JWT_SECRET` forte em homologacao/producao.
- Senhas devem permanecer apenas como hash bcrypt.
- Chaves server-side do Supabase devem ficar somente no backend.

## Aviso sobre os calculos

Os calculos atuais sao estimativas para validar produto e fluxo. Antes de publicar como referencia publica, as regras fiscais devem ser revisadas com fontes oficiais e/ou apoio contabil.

O projeto nao substitui orientacao juridica, fiscal ou contabil.
