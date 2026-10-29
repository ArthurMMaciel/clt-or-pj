---
name: design-ui
description: Sistema visual e regras de UX do frontend CLT ou PJ (cores por lado CLT/PJ, tipografia, componentes .card/.btn, padroes de formulario e de resultado, textos para o usuario). Use ao criar ou alterar telas, componentes ou textos em frontend/src, ao revisar layout no browser, ou ao montar landing e materiais visuais do produto. Nao use para regras de calculo (ver regras-clt-pj).
---

# Design e UX - CLT ou PJ

Stack: React + Tailwind 3. Tokens em `frontend/tailwind.config.ts`, componentes base em `frontend/src/styles.css` (`@layer components`). Antes de criar classe nova, reutilizar o que existe.

## Cores

| Token | Uso |
|---|---|
| `ink` | Texto e superficies escuras (CTA final, numero do passo) |
| `paper` / `line` | Fundo da pagina / bordas e divisores |
| `mint` (`DEFAULT`, `dark`, `soft`) | Marca e acao principal (botoes, foco, destaque do valor recomendado) |
| `clt` (`DEFAULT`, `soft`, `ink`) | Tudo que representa o lado CLT: barras, badges, veredito CLT |
| `pj` (`DEFAULT`, `soft`, `ink`) | Tudo que representa o lado PJ |
| `lime` | Acento pontual (marca-texto do hero, icone do logo, CTA sobre fundo `ink`) |
| `clay` | Erros |

Regra: a cor da marca (`mint`) nao representa nenhum dos lados, para o produto nao parecer torcer por CLT ou PJ. Nunca usar azul/amarelo/verde aleatorios para diferenciar opcoes.

## Tipografia e numeros

- `font-display` (Plus Jakarta Sans) em h1-h3; `font-sans` (Inter) no resto. Fontes carregadas no `index.html`.
- Todo valor monetario usa a classe `.num` (algarismos tabulares). Resumos usam `BRL0` (sem centavos); detalhamento usa `BRL`.
- `.eyebrow` para rotulo de secao acima do titulo.

## Componentes base

`.card`, `.btn-primary`, `.btn-secondary`, `.btn-ghost`, `.btn-lg`, `.badge`, `.hint`. Inputs, selects e labels ja vem estilizados pelo `@layer base`.

## Formularios

- Mostrar primeiro so o essencial (salario, beneficios, valor da nota, custos obvios). Campos tecnicos (regime, Fator R, faturamento 12m, reservas) ficam em `<details>` "avancado". Inputs dentro de `<details>` fechado continuam sendo enviados no `FormData`.
- Campo que so faz sentido numa condicao aparece so nela (ex.: aliquota manual so com regime manual).
- Todo campo com jargao ganha `hint` em linguagem simples. Sufixos (`%`, `dias`, `meses`) dentro do input.
- Booleanos como `Toggle` (pilula), nao checkbox cru.
- Nomes dos campos (`name=`) sao contrato com `readCLT`/`readPJ`; renomear so junto.

## Resultado

Ordem fixa: veredito colorido pelo lado vencedor -> barras do pacote anual (CLT vs PJ) -> 4 numeros-chave (`Stat`) -> quanto separar por mes -> `<details>` "Como chegamos nesse numero" -> aviso legal. No celular, rolar ate o resultado depois do calculo.

## Textos

- Falar com o usuario final, em segunda pessoa, sem jargao interno. Nunca expor estrategia, notas de produto ou recomendacao de fornecedor na interface.
- Nao inventar prova social ("mais escolhido", numero de usuarios) sem dado real.
- Numeros de exemplo na landing vem do motor (ver skill `validar-calculadora`).
- Toda tela de resultado e o rodape levam o aviso de simulacao educativa.

## Verificacao

Depois de mudar UI: rodar `npm.cmd run build` em `frontend`, abrir no browser em desktop e em 375px, conferir que nao ha rolagem horizontal (`document.documentElement.scrollWidth === innerWidth`) e que o header cabe sem cortar botoes. Mudou `tailwind.config.ts`? Reiniciar o Vite.
