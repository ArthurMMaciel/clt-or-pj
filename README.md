# CLT ou PJ

Aplicacao para comparar propostas CLT e PJ no contexto brasileiro, com foco em estimativa financeira, explicacao dos criterios e historico para usuarios cadastrados.

## Stack inicial

- Backend: Go, Gin, API REST
- Frontend: React, TypeScript, Vite, Tailwind CSS
- Banco planejado: PostgreSQL via Supabase
- Autenticacao planejada: JWT
- Email planejado: SendGrid

## Estrutura

- `docs/`: proposta de produto, MVP e fluxos
- `backend/`: API REST em Go
- `frontend/`: interface web em React
- `supabase/migrations/`: schema inicial para usuarios, tokens e historico de calculos

## Rodando local

### Backend

```powershell
cd backend
$env:GOCACHE='C:\Projetos\clt-or-pj\backend\.gocache'
& 'C:\Program Files\Go\bin\go.exe' run ./cmd/api
```

### Frontend

```powershell
cd frontend
npm.cmd run dev -- --host 127.0.0.1
```

## Variaveis de ambiente

O arquivo `.env` local fica fora do git. Use `.env.example` como referencia para homologacao/producao.

## Supabase

A migration inicial esta em `supabase/migrations/20260604133000_initial_auth_and_calculations.sql`.

Supabase CLI instalada localmente no projeto. Use:

```powershell
npx.cmd supabase --version
```

Para linkar o projeto remoto, informe um access token pessoal da Supabase (`sbp_...`) por login interativo ou variavel de ambiente:

```powershell
npx.cmd supabase login
npx.cmd supabase link --project-ref zymvtqunqpmwberejjyt
npx.cmd supabase db push
```

Sem CLI, cole o SQL da migration no SQL Editor do Supabase.

## Autenticacao

Senhas sao armazenadas como hash bcrypt. O JWT carrega apenas dados de identificacao do usuario, como id, nome, email e role. A senha nao entra no JWT.

## Aviso

Os calculos iniciais sao estimativas para validar produto e fluxo. Antes de publicar, as regras fiscais devem ser revisadas com fontes oficiais e/ou apoio contabil.
