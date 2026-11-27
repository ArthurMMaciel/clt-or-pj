---
name: design-ui
description: Sistema visual e regras de UX do frontend CLT ou PJ (cores por lado CLT/PJ, tipografia, componentes .card/.btn, padroes de formulario e de resultado, textos para o usuario). Use ao criar ou alterar telas, componentes ou textos em frontend/src, ao revisar layout no browser, ou ao montar landing e materiais visuais do produto. Nao use para regras de calculo (ver regras-clt-pj).
---

# Design e UX - CLT ou PJ

Stack: React + Tailwind 3. Tokens em `frontend/tailwind.config.ts`, componentes base em `frontend/src/styles.css` (`@layer components`). Antes de criar classe nova, reutilizar o que existe. Racional e historico em `docs/product-evolution/` (DESIGN_STRATEGY, DESIGN_SYSTEM, UX_AUDIT).

## Direcao: "livro-caixa"

O produto entrega uma conta que a pessoa leva para uma negociacao. A interface parece um documento financeiro cuidadoso: papel claro, filetes finos, titulos em serifa, numeros tabulares, linhas de conta com pontilhado. Nao reintroduzir: raios grandes (`rounded-2xl`+), sombras difusas, icones dentro de quadradinhos coloridos, chips flutuando, brilho/glow, gradientes decorativos, glassmorphism, animacao de entrada em cada bloco.

## Cores

| Token | Uso |
|---|---|
| `ink` | Texto principal |
| `muted` | Texto secundario (7,5:1) |
| `subtle` | Dicas e legendas; minimo para texto pequeno (5,1:1). Nunca usar `text-ink/40`-`/55` |
| `paper` / `line` | Fundo da pagina / filetes e divisores |
| `mint` (`DEFAULT`, `dark`, `soft`) | Marca e acao principal (botoes, foco, link) |
| `forest` (`DEFAULT`, `deep`) | Superficies de marca (hero, CTA final, painel do login) e o bloco do valor recomendado |
| `lime` | So sobre `forest`: palavra-chave do hero, numero recomendado, `.btn-lime` |
| `clt` / `pj` (`DEFAULT`, `soft`, `ink`) | Tudo que representa cada lado: barras, abas, filete do veredito, badges |
| `clay` | Erros |

Regra: a cor da marca (`mint`) nao representa nenhum dos lados, para o produto nao parecer torcer por CLT ou PJ. Nunca usar azul/amarelo/verde aleatorios para diferenciar opcoes.

## Tipografia e numeros

- `font-display` = Source Serif 4 (600, italico 400) em h1, h2 e numeros de destaque. h3 e interface em `font-sans` (Inter). Fontes no `index.html`.
- h1/h2 ja saem `font-semibold` pela base; nao usar `font-bold` neles (a serifa so tem 600 carregado). Titulos de pagina: `text-[1.9rem] sm:text-[2.4rem]`; hero ate `lg:text-[3.9rem]`.
- Todo valor monetario usa `.num`. Resumos usam `BRL0`; detalhamento usa `BRL`.
- `.eyebrow` para rotulo de secao acima do titulo.

## Formas e superficies

- `rounded-md` (badges, itens internos), `rounded-lg` (botoes, inputs, avisos, mini-cards `Stat`), `rounded-xl` (`.card`). Nada maior.
- `.card` = branco + filete, sem sombra. `shadow-overlay` so no que flutua de verdade (gaveta do menu, simulador sobre o hero).
- Separar secoes com `border-t border-line`, nao com mais cartoes. Nao aninhar cartao em cartao.
- `.ruled-dark` para superficies de marca (pauta discreta sobre `forest-deep`).
- `.ledger-row` + `<span class="ledger-fill">` para linhas rotulo ... valor (resultado, detalhamento, estado vazio). Na calculadora use o componente `LedgerRow`.

## Componentes base

`.card`, `.btn-primary`, `.btn-secondary`, `.btn-ghost`, `.btn-lime` (so sobre forest), `.btn-lg`, `.badge`, `.hint`, `.eyebrow`, `.num`, `.ledger-row`, `.ruled-dark`. Inputs, selects e labels ja vem estilizados pelo `@layer base`. Alvos de toque com no minimo 40 px (`.btn` ja garante).

## Movimento

Sem biblioteca: `src/lib/motion.tsx` + keyframes do `tailwind.config.ts`. Movimento so quando algo muda de estado.

- `animate-fade-up` (240 ms): painel de resultado novo, mensagens.
- `animate-grow-x` (500 ms): barras do pacote anual (mostram a proporcao CLT x PJ).
- `useCountUp(valor)` (450 ms): anima so quando o valor muda; na montagem mostra o valor final. Nunca contar a partir de zero.
- `animate-drawer-in` (gaveta), `animate-shake` (erro de formulario), transicoes `duration-fast`/`duration-base`.
- Proibido: animacao infinita, entrada no scroll, entrada escalonada do hero, hover que levanta cartao.
- `prefers-reduced-motion` desliga tudo (CSS em `styles.css` e checagem nos hooks).

## Imagens

Sem ilustracoes decorativas. Exemplos visuais usam numeros reais do motor (`EXAMPLE` de `src/lib/example.ts`). Foto externa so com licenca de uso comercial, registrada em `frontend/public/images/CREDITOS.md`.

## Estrutura das telas

- Visitante (e paginas publicas, inclusive a landing logado): header fixo de 3.6rem no topo, conteudo em `max-w-6xl`. Sem rodape (removido de proposito no commit `03e5428`). O wrapper define `--sticky-offset` com a altura do header; elementos `sticky` usam `top-[calc(var(--sticky-offset,0px)+1.5rem)]`.
- Skip link "Pular para o conteudo" aponta para `#conteudo` (o `<main>` dos dois layouts).
- Logado em `/calculadora`, `/historico`, `/conversas` e `/admin` (`APP_ROUTES`): `AppLayout` com sidebar branca presa a borda, `border-r`, grupos Simular / Historico / Em breve, item ativo com filete `mint` a esquerda e cartao do usuario com Sair. Abaixo de `lg` vira barra superior com gaveta (`animate-drawer-in`, fecha com Esc, clique fora ou troca de rota; foco vai para "Fechar menu" e volta ao botao do menu). O conteudo ocupa toda a largura ao lado da sidebar (sem `max-w` nem `mx-auto`).
- Rota nova do produto entra em `APP_ROUTES` e num grupo da sidebar.
- Listas operacionais (historico): tabela no desktop (`th scope="col"`, `caption`), lista no celular. Sem animacao por item.

## Formularios

- Mostrar primeiro so o essencial (salario, beneficios, valor da nota, custos obvios). Campos tecnicos (regime, Fator R, faturamento 12m, reservas) ficam em `<details>` "avancado". Inputs dentro de `<details>` fechado continuam sendo enviados no `FormData`.
- Campo que so faz sentido numa condicao aparece so nela (ex.: aliquota manual so com regime manual).
- Todo campo com jargao ganha `hint` em linguagem simples, ligado ao input por `aria-describedby` (`FieldHint`). Sufixos (`%`, `dias`, `meses`) dentro do input.
- Booleanos como `Toggle`: caixa com marca de selecao visivel; o estado nunca depende so de cor.
- Nomes dos campos (`name=`) sao contrato com `readCLT`/`readPJ`; renomear so junto.
- Seletor de modo: segmentado numa linha em qualquer largura (rotulo curto abaixo de `sm`), botoes com `aria-pressed`, descricao do modo ativo logo abaixo.
- No modo "comparar" o formulario tem duas abas sublinhadas, Proposta CLT e Proposta PJ (com o Contrato PJ), em todas as larguras; cada aba mostra o valor digitado. A aba inativa fica `hidden` e continua no `FormData`. O botao de calcular mora no topo da coluna do resultado no desktop (`form=` aponta para o formulario) e no fim da aba PJ no celular; no celular, Enter na aba CLT so leva para a aba PJ.
- Depois do primeiro calculo o botao vira "Recalcular". Editar qualquer campo marca o resultado como desatualizado: aviso ambar + resultado a 60% de opacidade ate recalcular.
- Pro-labore, faturamento 12m e folha 12m comecam vazios ("Automatico") e vao como 0: o motor usa 28% da nota, nota x 12 e pro-labore x 12, inclusive na busca do valor de empate. Nao voltar a preencher valores fixos.
- Erros de rede passam por `friendlyError`: nunca mostrar `Failed to fetch`, "API" ou detalhe de infraestrutura.

## Autenticacao

Login, cadastro e confirmacao usam `AuthLayout` (`src/components/AuthCard.tsx`): formulario a esquerda e painel `.ruled-dark` com card de exemplo (`EXAMPLE`) a direita; no celular o painel vira um cabecalho curto. Campos com `Field`/`PasswordField` (erro inline com `aria-invalid`, mostrar/ocultar senha), validacao no cliente com `noValidate`, erro do servidor em `FormMessage` (treme a cada tentativa) e sucesso em `SuccessState`.

## Resultado

O painel remonta a cada calculo (`key`) e entra com `animate-fade-up`. Ordem fixa:

1. Cabecalho com filete na cor do lado vencedor: "Veredito", frase do veredito (serifa, cor do lado), diferenca anual em numero grande e o resumo do motor. Nos modos de equivalencia, o valor procurado em numero grande.
2. Barras do pacote anual (CLT vs PJ).
3. "Para negociar como PJ": `Stat` para empatar e `Stat highlight` recomendado (unico bloco `forest` + `lime`).
4. "Liquido por mes": uma `LedgerRow` por lado (nunca misturar os dois lados no mesmo numero) e o aviso de quanto separar.
5. `<details>` "Ver a conta completa" com linhas de conta por lado e "Por que".
6. Aviso de simulacao educativa.

No celular, rolar ate o resultado depois do calculo.

## Textos

- Falar com o usuario final, em segunda pessoa, sem jargao interno. Nunca expor estrategia, notas de produto ou recomendacao de fornecedor na interface.
- Nao inventar prova social ("mais escolhido", numero de usuarios, logos de empresas, depoimentos) sem dado real.
- Nao afirmar rotina que nao existe (ex.: "revisamos as tabelas todo ano") nem vender recurso futuro na area publica (IA fica so como "Em breve" na sidebar logada).
- Numeros de exemplo na landing vem do motor (ver skill `validar-calculadora`). O mini-simulador usa `quickCLT`/`quickPJ` de `src/lib/defaults.ts`, que precisam enviar as mesmas premissas do formulario da calculadora.
- Copy assertiva, frases curtas, sem antitese ("X, nao Y"). A secao de precos so lista o que o codigo entrega.
- Links da landing para a calculadora usam `?modo=compare|clt_to_pj|pj_to_clt` e, opcionalmente, `salario`, `beneficios`, `nota` (a calculadora preenche e calcula sozinha).
- Toda tela de resultado leva o aviso de simulacao educativa; a landing o mostra em "Como calculamos".

## Verificacao

Depois de mudar UI: `npm.cmd run build` em `frontend`, abrir no browser em desktop e em 375 px, conferir que nao ha rolagem horizontal (`document.documentElement.scrollWidth <= innerWidth`) e que o header cabe sem cortar botoes. Para testar calculo sem disputar portas com outro servidor, use as configs `api-review` (8091) e `web-review` (5186) do `.claude/launch.json`. Mudou `tailwind.config.ts`? Reiniciar o Vite.
