# Changelog — evolução de design (2026-11-26)

Nenhum contrato de API, nome de campo (`name=`), regra de cálculo ou rota foi alterado.

| Arquivo | Mudança | Motivo |
|---|---|---|
| `frontend/tailwind.config.ts` | Fonte de títulos Source Serif 4; tokens `muted`/`subtle`; sombras reduzidas a `card`/`overlay`; durações `fast`/`base`; animações mais curtas; removidos `float`, `pop-in`, `glow`, `rounded-4xl/5xl` | Direção "livro-caixa", contraste AA, menos movimento |
| `frontend/index.html` | Carrega Source Serif 4 (600 + itálico 400) no lugar de Inter Tight | Identidade; uma família a menos para o mesmo papel |
| `frontend/src/styles.css` | Base e componentes reescritos: raios menores, foco com anel e offset, `.ledger-row`, `.ruled-dark`; `.reveal` removido | Consistência e identidade |
| `frontend/src/components/Logo.tsx` | Palavra em serifa com "ou" itálico; sem rotação no hover | Identidade |
| `frontend/src/components/HillsArt.tsx` | Removido | Decoração genérica sem função; substituída por `.ruled-dark` |
| `frontend/src/components/AppLayout.tsx` | Itens de menu sem quadradinhos de ícone, indicador lateral na página atual; gaveta com foco gerenciado; `id="conteudo"` | Consistência, acessibilidade |
| `frontend/src/components/AuthCard.tsx` | Painel `forest` pautado sem colinas, brilho ou chip flutuante; tokens de texto | Consistência |
| `frontend/src/main.tsx` | Header mais baixo, sem "IA em breve"; skip link; `--sticky-offset`; tela "Em breve" sem cartão decorativo | Corrige resultado escondido; acessibilidade; não vender recurso inexistente |
| `frontend/src/pages/CalculatorPage.tsx` | Seletor segmentado; abas sublinhadas; `FormSection` com filete; `Toggle` com marca; dicas com `aria-describedby`; resultado reorganizado (veredito + diferença, barras, "Para negociar como PJ", "Líquido por mês", conta completa em linhas de conta); aviso de resultado desatualizado; `friendlyError` | Jornada central |
| `frontend/src/pages/LandingPage.tsx` | Reescrita: hero pautado sem animação de entrada; seções em filetes; removidos Showcase, mockups e chips; preço sem card de IA; metodologia sem promessa de revisão anual | Página mais curta e honesta |
| `frontend/src/pages/HistoryPage.tsx` | Tabela no desktop, lista no celular, resumo em uma linha, skeleton de tabela | Uso recorrente |
| `frontend/src/lib/motion.tsx` | `useCountUp` não anima na montagem e usa 450 ms; `Reveal` ficou estático | Números falsos durante animação |
| `frontend/src/pages/{Login,Register,ConfirmEmail,Recovery,LegalDraft}Page.tsx` | Só classes de cor de texto, peso de título e raio | Consistência de tokens; lógica intocada |
| `.claude/launch.json` | Configs `api-review` (8091) e `web-review` (5186) | Validar sem disputar portas com servidores já em uso |
| `.claude/skills/design-ui/SKILL.md` | Atualizada para o novo sistema | Evitar que próximas sessões reintroduzam o visual antigo |
| `docs/product-evolution/*` | Documentação desta evolução | Continuidade |
