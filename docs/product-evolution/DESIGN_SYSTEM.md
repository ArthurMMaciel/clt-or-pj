# Design system

Fonte da verdade: `frontend/tailwind.config.ts` (tokens) e `frontend/src/styles.css` (base e componentes). Guia operacional para agentes: `.claude/skills/design-ui/SKILL.md`.

## Tokens

| Grupo | Token | Valor | Uso |
|---|---|---|---|
| Texto | `ink` | #0e1d17 | Texto principal |
| | `muted` | #45524b | Texto secundário (7,5:1 no `paper`) |
| | `subtle` | #5f6b65 | Dicas e legendas, mínimo para texto pequeno (5,1:1 no `paper`) |
| Fundo | `paper` / `line` | #f4f5f1 / #dfe3dc | Página / filetes |
| Marca | `mint` | #17694a | Ação principal, foco |
| | `forest` | #103d2c / deep #0a281d | Superfícies de marca, valor recomendado |
| | `lime` | #d4f46a | Só sobre `forest` |
| Lados | `clt` / `pj` | azul / âmbar (+ `soft`, `ink`) | Tudo que representa um lado |
| Estado | `clay` | #b8381f | Erro |
| Sombra | `card` / `overlay` | sutil / elevada | `overlay` só para gaveta e simulador do hero |
| Duração | `fast` / `base` | 120 / 200 ms | Hover e foco / transições |
| Animação | `fade-up` 240 ms, `grow-x` 500 ms, `drawer-in` 220 ms, `shake` 300 ms | | |

Tipografia: `font-display` = Source Serif 4 (600, itálico 400) em h1, h2 e números de destaque; `font-sans` = Inter no resto. h3 usa Inter semibold. Inter Tight foi removida.

Raios: `rounded-md` (6 px) controles internos e badges; `rounded-lg` (8 px) botões, inputs, avisos; `rounded-xl` (12 px) cartões. Nada acima disso.

## Componentes (CSS)

| Classe | Uso |
|---|---|
| `.card` | Superfície branca com filete, sem sombra |
| `.btn-primary` / `.btn-secondary` / `.btn-ghost` | Ação principal / secundária / terciária. Altura mínima 40 px |
| `.btn-lime` | CTA sobre `forest` apenas |
| `.btn-lg` | Altura 48 px |
| `.badge` | Rótulo curto, `rounded-md` |
| `.eyebrow` | Rótulo de seção acima do título |
| `.hint` | Dica de campo (`subtle`) |
| `.num` | Algarismos tabulares em todo valor |
| `.ledger-row` + `.ledger-fill` | Linha de conta: rótulo, pontilhado, valor |
| `.ruled-dark` | Fundo `forest-deep` pautado |

## Componentes (React, em `CalculatorPage.tsx`)

- `FormSection`: cartão com filete lateral na cor do lado.
- `Toggle`: caixa de seleção com marca visível (estado não depende só de cor).
- `MoneyField` / `NumberField` / `Select`: rótulo visível, dica ligada por `aria-describedby`.
- `ProposalTabs`: abas sublinhadas com o valor digitado de cada lado.
- `Stat`: número de destaque; `highlight` = valor recomendado em `forest` + `lime`.
- `LedgerRow`: linha de conta reutilizada no resultado, no detalhamento e no estado vazio.
- `Block`: seção do cartão de resultado separada por filete.

## Padrões

- Seletor de modo: botões com `aria-pressed`, uma linha em qualquer largura, descrição do modo ativo abaixo.
- Resultado desatualizado: ao editar após calcular, aviso âmbar + resultado a 60% de opacidade + botão "Recalcular".
- Erros de rede: sempre `friendlyError`, nunca `err.message` cru.
- Listas operacionais (histórico): tabela no desktop, lista no celular, sem animação por item.
