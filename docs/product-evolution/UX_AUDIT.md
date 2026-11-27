# Auditoria de UX — estado anterior e correções

Auditoria independente feita em 2026-11-26 navegando o sistema local (1024, 1280, 768, 375 e 360 px) e lendo o código. A auditoria questionou também as regras da skill `design-ui` então vigentes, que já descreviam o visual criticado.

Severidade: C crítica, A alta, M média, B baixa. Status: ✅ corrigido, ⏳ pendente.

| # | Local | Problema | Evidência | Impacto | Sev. | Status |
|---|---|---|---|---|---|---|
| 1 | Calculadora, resultado (desktop) | Painel fixo usava `lg:top-6` sob um header fixo de ~57 px: o topo do resultado (veredito) ficava escondido ao rolar | Captura a 1024 px com o cartão cortado sob o header | Usuário perde o veredito | A | ✅ offset via `--sticky-offset` |
| 2 | Calculadora | Editar campos depois de calcular não indicava que o resultado estava velho | Fluxo manual: troca do salário mantinha o veredito antigo | Decisão com número errado | A | ✅ aviso "Você mudou valores" + resultado esmaecido + botão "Recalcular" |
| 3 | Calculadora, erro | Falha de rede mostrava "Failed to fetch" em inglês + "Confira se a API está no ar" | `ResultPanel` concatenava `err.message` com texto técnico | Mensagem incompreensível e exposição de infraestrutura | A | ✅ `friendlyError`, validado com CORS bloqueado |
| 4 | Resultado | Cartão "Líquido no mês" mostrava PJ como valor e CLT no rodapé | `Stat` com `detail="PJ · CLT R$ …"` | Leitura ambígua | M | ✅ bloco "Líquido por mês" com uma linha por lado |
| 5 | Resultado e hero | Contadores animavam a partir de zero por 900 ms; capturas mostraram CLT R$ 86.373 enquanto o valor real era R$ 126.101 | Captura a 768 px | Números falsos na tela de uma ferramenta financeira | A | ✅ count-up só em mudança de valor, 450 ms |
| 6 | Landing, celular | Hero com `animate-fade-up` escalonado: primeiro paint praticamente vazio | Captura a 375 px logo após carregar | Pior LCP percebido | A | ✅ entradas removidas |
| 7 | Landing | "Revisamos as tabelas todo início de ano" | `Methodology` | Contradiz o plano de lançamento | A | ✅ texto removido |
| 8 | Landing e header | Card de preço e item de menu "IA em breve" vendem recurso inexistente | `Pricing`, header público | Promessa sem lastro, ruído | M | ✅ removidos da área pública; item da sidebar logada mantido |
| 9 | Global | Texto secundário com `text-ink/45` a `/55`: contraste 2,84:1 no fundo `paper` | Cálculo de contraste no navegador | Falha WCAG 1.4.3 | A | ✅ tokens `muted` (7,5:1) e `subtle` (5,1:1) |
| 10 | Global | Estética genérica: `rounded-3xl` em tudo, sombras difusas, ícones em quadradinhos coloridos, chips flutuando, brilho lima, gradientes de colinas | Capturas da landing | Produto parece template; reduz confiança | A | ✅ direção "livro-caixa" |
| 11 | Landing | Seção "Showcase" repetia o resultado do hero com mockups de navegador e celular | Mesmos números do mini simulador | Página longa (9.660 px no celular) sem informação nova | M | ✅ removida; 6.629 px |
| 12 | Calculadora, celular | Seletor de modo em três linhas de ~70 px | Captura a 375 px | Formulário começava abaixo da dobra | M | ✅ seletor segmentado numa linha + descrição do modo |
| 13 | Calculadora | Toggles de direitos indicavam estado só por cor | `Toggle` com ponto colorido | Falha WCAG 1.4.1 | M | ✅ caixa com marca de seleção |
| 14 | Calculadora | Dicas dos campos sem `aria-describedby` | `MoneyField`, `NumberField` | Leitor de tela não lê a dica | M | ✅ |
| 15 | Header público | Sem link "Pular para o conteúdo" | `main.tsx` | Navegação por teclado mais lenta | B | ✅ |
| 16 | Sidebar celular | Gaveta não movia o foco nem o devolvia ao fechar | `AppLayout` | Usuário de teclado perde contexto | M | ✅ validado (foco vai para "Fechar menu" e volta para "Abrir menu") |
| 17 | Histórico | Cartões em grade com animação por item; difícil comparar simulações | `HistoryPage` | Uso recorrente ineficiente | M | ✅ tabela no desktop, lista no celular |
| 18 | Resultado | Painel fixo mais alto que a tela esconde o fim até a coluna do formulário acabar | Com "Ver a conta completa" aberto | Precisa rolar mais | B | ⏳ |
| 19 | Login | Botão demo usa `.btn-lime` sobre fundo branco (o token é para fundo `forest`) | `LoginPage.tsx` | Inconsistência pequena; só em ambiente local | B | ⏳ arquivo em edição por outra sessão |
| 20 | Código | `ConversationsPage.tsx` e `AdminDashboard.tsx` fora das rotas | `main.tsx` | Manutenção e confusão | B | ⏳ decisão do time |
| 21 | Frontend | Sem lint e sem testes automatizados | `package.json` | Regressões passam despercebidas | M | ⏳ |

## Heurísticas de Nielsen (resumo)

- Visibilidade do estado: faltava indicar resultado desatualizado (#2) e havia números transitórios (#5). Corrigido.
- Correspondência com o mundo real: linguagem já era boa; "Ver a conta completa" substitui "Como chegamos nesse número" e casa com o nome do produto.
- Consistência: três estilos de cartão, pílulas e quadradinhos de ícone convivendo. Unificado em `.card` com filete.
- Prevenção de erros: #2 e #13.
- Recuperação de erros: #3.
- Estética minimalista: #10 e #11.
