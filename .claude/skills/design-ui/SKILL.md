---
name: design-ui
description: Sistema visual e regras de UX do frontend CLT ou PJ (cores por lado CLT/PJ, tipografia, componentes .card/.btn, padroes de formulario e de resultado, textos para o usuario). Use ao criar ou alterar telas, componentes ou textos em frontend/src, ao revisar layout no browser, ou ao montar landing e materiais visuais do produto. Nao use para regras de calculo (ver regras-clt-pj).
---

# Design e UX - CLT ou PJ

Stack: React + Tailwind 3. Tokens em `frontend/tailwind.config.ts`, componentes base em `frontend/src/styles.css` (`@layer components`). Antes de criar classe nova, reutilizar o que existe.

## Cores

| Token | Uso |
|---|---|
| `ink` | Texto |
| `forest` (`DEFAULT`, `deep`, `light`) | Superficies escuras de destaque: hero e CTA final da landing, secao "Como calculamos", card do valor recomendado |
| `paper` / `line` | Fundo da pagina / bordas e divisores |
| `mint` (`DEFAULT`, `dark`, `soft`) | Marca e acao principal (botoes, foco, destaque do valor recomendado) |
| `clt` (`DEFAULT`, `soft`, `ink`) | Tudo que representa o lado CLT: barras, badges, veredito CLT |
| `pj` (`DEFAULT`, `soft`, `ink`) | Tudo que representa o lado PJ |
| `lime` (`DEFAULT`, `soft`) | Unico acento: palavra-chave do hero, icone do logo, numero recomendado e CTA (`.btn-lime`) sobre fundo `forest` |
| `clay` | Erros |

Regra: a cor da marca (`mint`) nao representa nenhum dos lados, para o produto nao parecer torcer por CLT ou PJ. Nunca usar azul/amarelo/verde aleatorios para diferenciar opcoes.

## Tipografia e numeros

- `font-display` (Inter Tight, pesos 500-800) em h1-h3; `font-sans` (Inter) no resto. Fontes carregadas no `index.html`. Titulos de secao em `font-bold`, hero em ate `text-[4.2rem]`.
- Todo valor monetario usa a classe `.num` (algarismos tabulares). Resumos usam `BRL0` (sem centavos); detalhamento usa `BRL`.
- `.eyebrow` para rotulo de secao acima do titulo.

## Formas

Linguagem arredondada (referencia: SaaS atuais tipo dashboard de NPS). `.card` = `rounded-3xl`; blocos grandes da landing `rounded-4xl`/`rounded-5xl`; inputs `rounded-xl`; botoes, badges e toggles `rounded-full`; mini-cards internos (`Stat`) `rounded-2xl`. Sombras difusas: `shadow-card` (padrao), `shadow-lift` (destaque/hover), `shadow-float` (elementos flutuando sobre fundo escuro), `shadow-glow` (hover do `.btn-lime`).

## Componentes base

`.card`, `.btn-primary`, `.btn-secondary`, `.btn-ghost`, `.btn-lime`, `.btn-lg`, `.badge`, `.hint`, `.eyebrow`. Inputs, selects e labels ja vem estilizados pelo `@layer base`.

## Movimento

Sem biblioteca: `src/lib/motion.tsx` + keyframes do `tailwind.config.ts`.

- `<Reveal delay={ms}>`: entrada no scroll (fade + subida). Em listas, escalonar 60-120 ms por item.
- `useCountUp(valor, { start })`: numeros contando ate o valor (resultado, mini-simulador).
- `useInView()`: dispara animacao quando o bloco aparece (barras com `animate-grow-x`).
- Utilitarios: `animate-fade-up` (entrada do hero, com `animationDelay`), `animate-float`/`animate-float-slow` (chips flutuantes), `animate-pop-in` (troca de veredito), botoes com `hover:-translate-y-px` e `active:scale-[0.97]`.
- Duracoes entre 150 e 900 ms. `prefers-reduced-motion` desliga tudo (CSS em `styles.css` e checagem nos hooks); nao criar animacao que ignore isso.

## Imagens

A landing usa arte propria: paisagem de colinas em SVG (`HillsArt`) e mockups do produto em HTML (navegador e celular) com numeros reais do motor. Foto externa so com licenca de uso comercial, registrada em `frontend/public/images/CREDITOS.md`. Nao copiar imagens das referencias.

## Estrutura das telas

- Visitante (e paginas publicas, inclusive a landing logado): header no topo, conteudo em `max-w-6xl` e rodape.
- Logado em `/calculadora`, `/historico`, `/conversas` e `/admin` (`APP_ROUTES`): `AppLayout` (`src/components/AppLayout.tsx`) com sidebar branca presa a borda esquerda, altura total e `border-r` (logo, "Nova simulacao", grupos Simular / Sua conta / Em breve, cartao do usuario com Sair). Abaixo de `lg` vira barra superior com menu que abre a sidebar como gaveta (`animate-drawer-in`, fecha com Esc, clique fora ou troca de rota). O conteudo ocupa toda a largura ao lado da sidebar (sem `max-w` nem `mx-auto`): centralizar ou limitar abre um vao em telas largas e a sidebar parece solta.
- Rota nova do produto entra em `APP_ROUTES` e num grupo da sidebar.

## Formularios

- Mostrar primeiro so o essencial (salario, beneficios, valor da nota, custos obvios). Campos tecnicos (regime, Fator R, faturamento 12m, reservas) ficam em `<details>` "avancado". Inputs dentro de `<details>` fechado continuam sendo enviados no `FormData`.
- Campo que so faz sentido numa condicao aparece so nela (ex.: aliquota manual so com regime manual).
- Todo campo com jargao ganha `hint` em linguagem simples. Sufixos (`%`, `dias`, `meses`) dentro do input.
- Booleanos como `Toggle` (pilula), nao checkbox cru.
- Nomes dos campos (`name=`) sao contrato com `readCLT`/`readPJ`; renomear so junto.
- No modo "comparar" o formulario tem duas abas, Proposta CLT e Proposta PJ (com o Contrato PJ), em todas as larguras, para evitar rolagem; cada aba mostra o valor digitado. A aba inativa fica `hidden` e continua no `FormData`. O botao de calcular mora no topo da coluna do resultado no desktop (`form=` aponta para o formulario) e no fim da aba PJ no celular; no celular, Enter na aba CLT so leva para a aba PJ.
- Pro-labore, faturamento 12m e folha 12m comecam vazios ("Automatico") e vao como 0: o motor usa 28% da nota, nota x 12 e pro-labore x 12, inclusive na busca do valor de empate. Nao voltar a preencher valores fixos, senao quem troca so a nota fica com Fator R e faixa do Simples errados.

## Autenticacao

Login, cadastro e confirmacao usam `AuthLayout` (`src/components/AuthCard.tsx`): formulario a esquerda e painel `forest` com `HillsArt` e card de exemplo (`EXAMPLE` de `src/lib/example.ts`) a direita; no celular o painel vira um cabecalho compacto. Campos com `Field`/`PasswordField` (erro inline com `aria-invalid`, mostrar/ocultar senha), validacao no cliente com `noValidate`, erro do servidor em `FormMessage` (treme a cada tentativa) e sucesso em `SuccessState`.

## Resultado

O painel remonta a cada calculo (`key`) para animar: cartao com `animate-fade-up`, veredito com `animate-pop-in`, barras com `animate-grow-x` e numeros-chave com `<Money>` (count-up). Valor recomendado em `Stat highlight` (fundo `forest`, numero `lime`).

Ordem fixa: veredito colorido pelo lado vencedor -> barras do pacote anual (CLT vs PJ) -> 4 numeros-chave (`Stat`) -> quanto separar por mes -> `<details>` "Como chegamos nesse numero" -> aviso legal. No celular, rolar ate o resultado depois do calculo.

## Textos

- Falar com o usuario final, em segunda pessoa, sem jargao interno. Nunca expor estrategia, notas de produto ou recomendacao de fornecedor na interface.
- Nao inventar prova social ("mais escolhido", numero de usuarios, logos de empresas, depoimentos) sem dado real.
- Numeros de exemplo na landing vem do motor (ver skill `validar-calculadora`). O mini-simulador usa `quickCLT`/`quickPJ` de `src/lib/defaults.ts`, que precisam enviar as mesmas premissas do formulario da calculadora; senao o "PJ para empatar" diverge entre as telas.
- Copy assertiva, frases curtas, sem antitese ("X, nao Y"). Nao vender recurso que nao existe: a secao de precos so lista o que o codigo entrega.
- Links da landing para a calculadora usam `?modo=compare|clt_to_pj|pj_to_clt` e, opcionalmente, `salario`, `beneficios`, `nota` (a calculadora preenche e calcula sozinha).
- Toda tela de resultado e o rodape levam o aviso de simulacao educativa.

## Verificacao

Depois de mudar UI: rodar `npm.cmd run build` em `frontend`, abrir no browser em desktop e em 375px, conferir que nao ha rolagem horizontal (`document.documentElement.scrollWidth === innerWidth`) e que o header cabe sem cortar botoes. Mudou `tailwind.config.ts`? Reiniciar o Vite.
