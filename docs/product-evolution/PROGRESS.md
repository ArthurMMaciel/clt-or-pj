# Progresso

Fase atual: refinamento concluído para landing, calculadora, histórico, sidebar e autenticação (visual). Nada commitado.

## Concluído

Ver `CHANGELOG.md` e `VALIDATION_REPORT.md`.

## Backlog priorizado (plano de implementação)

| Prioridade | Item | Critério de aceitação |
|---|---|---|
| P1 | Lint (ESLint + jsx-a11y) e testes de componente para o resultado e o aviso de desatualizado | `npm run lint` e `npm test` no CI |
| P1 | Auditoria axe/Lighthouse em landing e calculadora | Zero violações sérias; LCP medido no celular |
| P1 | Validar cadastro, confirmação e recuperação de senha no novo visual quando a outra sessão terminar | Capturas a 375 e 1280 px; console limpo |
| P2 | Painel de resultado só fixo quando couber na tela (ou com rolagem própria) | Fim do resultado acessível sem rolar a página inteira |
| P2 | Botão demo do login com `.btn-secondary` em vez de `.btn-lime` | Lima só sobre `forest` |
| P2 | Decidir destino de `ConversationsPage.tsx` e `AdminDashboard.tsx` (órfãos) | Removidos ou roteados com autorização no servidor |
| P2 | Separar `CalculatorPage.tsx` (1.100 linhas) em `components/calculator/*` | Sem mudança visual; arquivos menores que 300 linhas |
| P3 | Página de imagem para compartilhamento (og:image) no visual novo | Prévia no LinkedIn com o resultado de exemplo |
| P3 | Capturas em 1440 e 1920 px | Sem vãos estranhos ao lado da sidebar |

## Decisões importantes

- Direção "livro-caixa" escolhida (ver `DESIGN_STRATEGY.md`). Serifa nos títulos é a mudança de marca mais visível; reverter é trocar `fontFamily.display` e a linha de fonte do `index.html`.
- Rodapé público continua removido (decisão do commit `03e5428`).
- Item "Análise com IA · Em breve" mantido só na sidebar logada; saiu do header público e da tabela de preços.

## Bloqueios

- Outra sessão está editando `LoginPage.tsx`, `demoAuth.tsx` e páginas de conta nesta mesma pasta; evitei mexer na lógica desses arquivos.
