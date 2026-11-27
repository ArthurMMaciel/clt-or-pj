# Estratégia de design

## Direções consideradas

| Direção | Ideia | Prós | Contras | Decisão |
|---|---|---|---|---|
| A. Polir o SaaS atual | Manter raios grandes, sombras e acentos lima, só ajustar espaçamento | Menor esforço | Continua parecendo template; não resolve a queixa principal ("ta feio") | Descartada |
| B. Livro-caixa editorial | Papel claro, filetes finos, títulos em serifa, números tabulares e linhas de conta com pontilhado | Remete a "fazer a conta", transmite precisão; mais leve (menos efeitos) | Serifa é mudança perceptível de marca | **Escolhida** |
| C. Fintech escura | Fundo escuro, alto contraste, neon | Moderna | Pior para formulários longos e leitura de números; fora do tom de cuidado financeiro | Descartada |

## Por que B

O produto entrega uma conta. A pessoa precisa confiar nos números e levá-los para uma negociação. Uma linguagem de documento (filetes, linhas de conta, serifa nos títulos) comunica isso melhor do que cartões flutuantes. A direção também remove dependências visuais caras (gradientes SVG, blur, animações infinitas) e encurta as páginas.

## Princípios

1. **Número primeiro.** O valor que decide vem antes da explicação, sem animação que atrase a leitura.
2. **Uma superfície, um filete.** Branco com borda de 1 px; sombra só no que flutua de verdade (gaveta, simulador sobre o hero).
3. **Cor com significado.** Azul é CLT, âmbar é PJ, verde é a marca e a ação. O lima aparece só sobre o verde-escuro.
4. **Movimento só quando algo muda.** Resultado novo entra em 240 ms; barras mostram proporção em 500 ms; valores que mudam contam em 450 ms. Nada se move sozinho.
5. **Dizer só o que é verdade.** Nada de prova social, recurso futuro vendido como plano ou rotina que não existe.

## Identidade

- Logo: monograma mantido; palavra "CLT *ou* PJ" em serifa com "ou" em itálico.
- Superfícies de marca (hero, CTA final, painel de login) em verde-escuro com pauta discreta (`.ruled-dark`), no lugar das colinas em gradiente.
- Linhas de conta com pontilhado (`.ledger-row`) no resultado e no estado vazio.

## Preservado

Cores da marca e dos lados, estrutura de rotas, sidebar logada, abas CLT/PJ no modo comparar, botão de calcular na coluna do resultado, todos os nomes de campos (`name=`), cálculos e contratos de API.
