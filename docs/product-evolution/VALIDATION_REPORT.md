# Relatório de validação

Ambiente: front em `localhost:5186` (config `web-review`) e API própria em `localhost:8091` (config `api-review`), para não interferir nos servidores já em execução em 5175/8080. Data: 2026-11-26.

## Executado

| Verificação | Resultado |
|---|---|
| `npx tsc --noEmit` | Sem erros |
| `npm run build` | OK. JS 300,42 → 286,47 kB (gzip 89,76 → 86,70). CSS 45,60 → 40,86 kB (gzip 7,96 → 7,70) |
| `go test ./...` (backend) | `calculator` e `config` OK; backend não foi alterado |
| Cálculo "comparar" 10.000 + 1.000 x 15.000 via API real | Diferença R$ 26.155, empate R$ 12.603, recomendado R$ 13.989: iguais aos valores antes da mudança |
| `clt_to_pj` (salário 8.000) e `pj_to_clt` (nota 18.000) por link direto | Calculam sozinhos e exibem o painel de equivalência |
| Aviso de resultado desatualizado | Aparece ao editar o salário após calcular; o valor da aba atualiza |
| Erro de rede (CORS bloqueado) | Mostra "Não conseguimos falar com o servidor…", sem texto técnico |
| Rolagem horizontal | `scrollWidth <= innerWidth` em 360, 375, 768, 1024 e 1280 px (landing, calculadora, histórico) |
| Seletor de modo a 360 px | Os três rótulos curtos cabem sem corte |
| Altura da landing | 1024 px: 5.517 → 4.114 px. 375 px: 9.660 → 6.629 px |
| Contraste dos tokens de texto | `subtle` 5,08:1 e `muted` 7,49:1 no `paper`; antes `ink/45` = 2,84:1 |
| Gaveta do menu (375 px, conta demo local) | Foco vai para "Fechar menu"; Esc fecha e devolve foco a "Abrir menu" |
| Histórico (conta demo local) | Tabela no desktop com cabeçalhos `scope="col"` e `caption`; lista no celular |
| Console em aba limpa | Zero erros em `/`, `/calculadora`, `/historico` |

## Não executado / pendente

- Verificação automatizada de acessibilidade (axe ou Lighthouse): nenhuma ferramenta instalada no projeto; não injetei scripts externos.
- Métricas de Web Vitals (LCP, INP, CLS) medidas: não coletadas. O ganho de LCP percebido no celular é inferido da remoção das animações de entrada, não medido.
- Leitor de tela real (NVDA, VoiceOver): não testado.
- Histórico com conta real e e-mail confirmado: validado só com a conta demo local.
- Telas de cadastro, confirmação e recuperação de senha: receberam ajustes de tokens, mas estão em edição por outra sessão; validar quando aquele trabalho terminar.
- 1440 e 1920 px: não capturados.

## Avaliação heurística (não é pesquisa com usuários)

| Dimensão | Peso | Antes | Depois | Evidência principal |
|---|---|---|---|---|
| Compreensão do produto | 10 | 8 | 8 | Proposta já era clara |
| Adequação ao público | 10 | 6 | 8 | Linguagem de documento financeiro; promessas falsas removidas |
| Usabilidade | 15 | 10 | 12 | Resultado desatualizado, erro de rede, "Líquido por mês" sem ambiguidade |
| Hierarquia visual | 10 | 6 | 8 | Veredito e diferença em destaque; recomendado como único bloco escuro |
| Consistência visual | 10 | 6 | 8 | Um cartão, um raio por papel, cores com significado |
| Navegação | 10 | 7 | 8 | Seletor numa linha, skip link, foco da gaveta |
| Acessibilidade | 10 | 5 | 7 | Contraste, estado sem depender de cor, `aria-describedby`; sem auditoria automatizada |
| Responsividade | 10 | 6 | 8 | Formulário mais acima no celular; sem overflow |
| Performance | 5 | 3 | 4 | Bundle menor, menos fontes, sem animações infinitas; sem Web Vitals medidos |
| Identidade visual | 5 | 2 | 4 | Serifa, pauta, linhas de conta |
| Microinterações e acabamento | 5 | 2 | 4 | Movimento só em mudança de estado |
| **Total** | 100 | **61** | **79** | Meta de 90 não atingida; ver oportunidades em `PROGRESS.md` |
