# Product Discovery — CLT ou PJ

Data: 2026-11-26. Fontes: README, `docs/plano-lancamento.md`, `DESIGN.md`, skills do repositório, código em `frontend/src` e `backend/internal`, uso do sistema no navegador.

## O que o produto resolve

Trabalhadores brasileiros recebem propostas CLT e PJ e não conseguem comparar o dinheiro que sobra no ano. O produto responde três perguntas (fato, README e `CalculatorPage.tsx`):

1. Tenho uma CLT e uma PJ: qual compensa mais? (`compare`)
2. Tenho só a CLT: quanto pedir como PJ? (`clt_to_pj`)
3. Tenho só a PJ: qual salário CLT equivale? (`pj_to_clt`)

O coração do produto é o **resultado da calculadora**: veredito, valor para empatar, valor recomendado com margem de risco e a conta detalhada. Todo o resto (landing, conta, histórico) existe para levar a esse resultado ou para voltar a ele.

## Fatos (código e documentação)

- Simulação pública sem login; conta grátis guarda histórico (`HistoryPage`, `/api/v1/me/calculations`).
- Regras de 2026: INSS, IRRF com Lei 15.270/2025, Simples Nacional com Fator R, margem de risco de 10% a 30% (skill `regras-clt-pj`, landing).
- Lançamento previsto para 2026 com versão gratuita; IA e cobrança adiadas (`plano-lancamento.md`).
- O plano de lançamento proíbe afirmar revisão anual de tabelas antes de existir a rotina. A landing afirmava "Revisamos as tabelas todo início de ano" (corrigido).
- Rodapé público removido de propósito no commit `03e5428`.
- `ConversationsPage.tsx` e `AdminDashboard.tsx` não estão em nenhuma rota (código órfão).

## Inferências (com evidência)

- Público principal: profissional de tecnologia ou serviços, de 25 a 45 anos, negociando proposta. Evidência: exemplos com salários de R$ 8 mil a R$ 15 mil, linguagem de "nota", "Fator R".
- Uso pontual e intenso: a pessoa simula várias vezes em poucos dias durante a negociação e volta quando a proposta muda. Evidência: histórico com "reabrir na calculadora", copy "quando a negociação andar".
- Uso relevante em celular (link compartilhado, LinkedIn). Evidência: `docs/linkedin-post.md`, cuidado existente com layout de 375 px.

## Hipóteses a validar

- A maioria usa o modo "comparar"; os modos de equivalência são secundários.
- O valor "recomendado" é o número que a pessoa leva para a negociação.
- Quem cria conta compara mais de duas propostas.

## Perfis e Jobs to Be Done

| Perfil | Job | Informação crítica | Risco de erro |
|---|---|---|---|
| Candidato com duas propostas | Quando recebo uma CLT e uma PJ, quero saber qual deixa mais dinheiro no ano para decidir com segurança | Veredito e diferença anual | Ignorar 13º, férias e FGTS e superestimar a PJ |
| CLT negociando virar PJ | Quando me oferecem PJ, quero saber o valor mínimo da nota para pedir sem perder dinheiro | Valor recomendado com margem | Pedir o valor de empate, sem margem para o risco |
| PJ avaliando CLT | Quando recebo uma CLT, quero saber se ela iguala meu PJ | Salário CLT equivalente | Comparar salário bruto com nota bruta |

## Jornada principal

Landing (mini simulador) → calculadora com valores preenchidos → resultado → ajuste de valores e recálculo → (opcional) conta → histórico → reabrir simulação.

Pontos de erro identificados: resultado desatualizado após editar campos sem recalcular; números intermediários exibidos durante animação; resultado fixo escondido sob o header.

## Riscos de negócio

- Número errado ou mal interpretado gera decisão financeira ruim. Por isso a interface prioriza clareza dos números sobre decoração.
- Promessas sem lastro (revisão anual, IA "em breve" vendida como plano) minam confiança no lançamento.
