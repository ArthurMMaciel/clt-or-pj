# Proposta do Produto e MVP

## Objetivo

Criar uma aplicacao simples para ajudar trabalhadores brasileiros a comparar propostas CLT e PJ sob o ponto de vista financeiro. A ferramenta deve responder perguntas como:

- Tenho uma proposta CLT de R$ 4.000. Qual valor PJ deveria pedir?
- Tenho uma proposta CLT e uma PJ. Qual vale mais a pena?
- Tenho uma proposta PJ. Qual seria um CLT equivalente?

A aplicacao deve funcionar sem cadastro para calculos rapidos. Usuarios cadastrados podem salvar historico. Administradores acompanham uso, usuarios e calculos.

## 1. Telas do MVP

### Publico geral

- **Home / Calculadora rapida**
  - Entrada para escolher o tipo de simulacao.
  - Acesso sem login.
  - Chamadas principais: comparar CLT x PJ, descobrir PJ equivalente, descobrir CLT equivalente.

- **Comparar CLT x PJ**
  - Formulario com dados do contrato CLT e do contrato PJ.
  - Exibe resultado financeiro e motivos.

- **CLT para PJ equivalente**
  - Usuario informa salario CLT, beneficios e descontos.
  - Sistema calcula valor PJ minimo sugerido.

- **PJ para CLT equivalente**
  - Usuario informa valor PJ, custos e reservas.
  - Sistema estima salario CLT equivalente.

- **Resultado da simulacao**
  - Resumo: vale, nao vale ou depende.
  - Liquido mensal estimado.
  - Equivalente anual.
  - Beneficios considerados.
  - Custos e reservas PJ.
  - Explicacao dos principais motivos.
  - CTA para criar conta e salvar historico.

- **Cadastro**
  - Nome, email e senha.
  - Envio de email de confirmacao.

- **Login**
  - Email e senha.
  - Recuperacao de senha em fase posterior.

- **Confirmacao de email**
  - Tela acessada por token de confirmacao.

### Usuarios cadastrados

- **Dashboard do usuario**
  - Ultimas simulacoes.
  - Atalho para nova simulacao.
  - Indicadores simples: total de simulacoes e ultima recomendacao.

- **Historico de calculos**
  - Lista de simulacoes feitas pelo usuario.
  - Filtros por tipo: comparacao, CLT para PJ, PJ para CLT.

- **Detalhe da simulacao**
  - Reabre o resultado salvo.
  - Permite duplicar a simulacao para recalcular com outros valores.

- **Perfil**
  - Dados basicos.
  - Alterar senha.
  - Preferencias futuras.

### Admin

- **Dashboard admin**
  - Grafico de usuarios cadastrados por mes.
  - Grafico de calculos feitos por mes.
  - Cards de resumo: usuarios totais, simulacoes totais, simulacoes no mes, usuarios confirmados.

- **Listagem de cadastrados/clientes**
  - Nome, email, data de cadastro, email confirmado, perfil, status.
  - Busca por nome/email.

- **Listagem de calculos**
  - Usuario, tipo de calculo, data, recomendacao, valor CLT, valor PJ.
  - Filtros por periodo, tipo e resultado.

- **Parametros de calculo**
  - Tela planejada para editar faixas, percentuais e defaults.
  - No MVP inicial pode ser somente leitura ou ficar para fase 2.

## 2. Entidades do banco

### `users`

- `id`
- `name`
- `email`
- `password_hash`
- `role`: `user` ou `admin`
- `email_confirmed_at`
- `created_at`
- `updated_at`

### `email_confirmations`

- `id`
- `user_id`
- `token_hash`
- `expires_at`
- `used_at`
- `created_at`

### `calculations`

- `id`
- `user_id` nullable para calculos anonimos
- `type`: `compare`, `clt_to_pj`, `pj_to_clt`
- `input_json`
- `result_json`
- `recommendation`: `clt`, `pj`, `neutral`
- `calculation_version`
- `created_at`

### `calculation_parameters`

- `id`
- `key`
- `value_json`
- `version`
- `active`
- `created_at`
- `updated_at`

### `admin_audit_logs`

- `id`
- `admin_user_id`
- `action`
- `metadata_json`
- `created_at`

## 3. Endpoints da API

### Publicos

- `GET /health`
- `POST /api/v1/calculations/compare`
- `POST /api/v1/calculations/clt-to-pj`
- `POST /api/v1/calculations/pj-to-clt`
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/confirm-email`

### Usuario autenticado

- `GET /api/v1/me`
- `GET /api/v1/me/calculations`
- `GET /api/v1/me/calculations/:id`
- `POST /api/v1/me/calculations/:id/duplicate`
- `PUT /api/v1/me/profile`

### Admin

- `GET /api/v1/admin/dashboard`
- `GET /api/v1/admin/users`
- `GET /api/v1/admin/calculations`
- `GET /api/v1/admin/parameters`
- `PUT /api/v1/admin/parameters/:id`

## 4. Modelo de calculo CLT x PJ

### Entradas CLT

- salario bruto mensal
- beneficios mensais nao tributaveis: VR/VA, ajuda de custo, outros
- beneficios mensais tributaveis quando existirem
- descontos mensais adicionais
- bonus/PLR anual opcional
- dependentes para IRRF
- considerar FGTS
- considerar 13 salario
- considerar ferias + 1/3
- considerar multa de 40% sobre FGTS como protecao em demissao sem justa causa

### Entradas PJ

- valor mensal do contrato
- regime tributario: automatico por Fator R, Simples Anexo III, Simples Anexo V ou aliquota manual
- receita bruta dos ultimos 12 meses
- folha/pro-labore dos ultimos 12 meses
- pro-labore mensal ou percentual de pro-labore
- meses pagos no ano
- custo mensal de contador
- custo mensal de plano de saude
- outros custos mensais
- reserva para ferias
- reserva para 13 equivalente
- reserva equivalente a FGTS
- reserva para emergencia/intervalo sem contrato
- risco contratual, aviso previo, pausa remunerada, exclusividade e possibilidade de outros clientes

### Saidas

- liquido mensal estimado CLT
- equivalente anual CLT
- INSS e IRRF mensal CLT
- 13 liquido, ferias liquidas, FGTS anual e protecao de demissao quando marcados
- liquido mensal estimado PJ
- equivalente anual PJ
- Simples/Fator R, aliquota efetiva, pro-labore, INSS e IRRF sobre pro-labore
- diferenca mensal
- diferenca anual
- valor PJ minimo sugerido para empatar
- valor PJ recomendado com premio de risco
- recomendacao: CLT, PJ ou neutro
- explicacoes dos principais fatores

### Observacao fiscal

O MVP usa uma versao 2026 das tabelas de INSS, IRRF e Simples Nacional. A comparacao continua sendo uma estimativa e deve exibir aviso de que nao substitui orientacao juridica, fiscal ou contabil. Antes de publicar como referencia publica, os parametros devem ser versionados e revisados contra fontes oficiais.

## 5. Backlog por fases

### Fase 1: MVP funcional

- Criar API de calculo publica.
- Criar frontend com formularios principais.
- Exibir resultado explicado.
- Criar cadastro/login.
- Salvar historico para usuario autenticado.
- Criar dashboard admin basico com dados agregados.

### Fase 2: Qualidade de produto

- Melhorar layout, paleta e responsividade.
- Adicionar graficos no resultado.
- Adicionar filtros no historico.
- Melhorar explicacoes do calculo.
- Criar pagina de parametros admin.

### Fase 3: Robustez

- Versionar parametros de calculo.
- Gerar OpenAPI/Swagger.
- Adicionar testes automatizados.
- Adicionar Docker Compose.
- Implementar recuperacao de senha.
- Implementar trilha de auditoria admin.

### Fase 4: Portifolio e publicacao

- Deploy do backend.
- Deploy do frontend.
- Supabase em producao.
- SendGrid em producao.
- Pagina publica com disclaimer.
- Documentacao tecnica no README.
