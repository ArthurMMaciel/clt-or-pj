---
name: regras-clt-pj
description: Regras de negocio, tributarias e trabalhistas do comparador CLT x PJ (INSS, IRRF com Lei 15.270/2025, desconto simplificado, FGTS, 13o, ferias, Simples Nacional Anexos III/V, Fator R, pro-labore, premio de risco, pejotizacao). Use ao alterar ou revisar backend/internal/calculator, ao discutir quais dados pedir ao usuario, ao escrever textos de resultado/landing, ou ao atualizar tabelas anuais. Nao use para auth, Supabase ou layout.
---

# Regras CLT x PJ

Fonte da verdade do calculo: `backend/internal/calculator/calculator.go` (parametros em `DefaultParameters()` e tabelas no topo do arquivo). O frontend nao calcula nada, so envia o formulario.

Toda mudanca de regra que altere resultado deve incrementar `Version` em `backend/internal/calculator/calculator.go` (hoje `mvp-2`), gravada como `calculation_version` em cada simulacao salva, para o historico continuar explicavel.

## Principio de comparacao (nao quebrar)

Comparar **dinheiro anual disponivel** dos dois lados, com a mesma regua:

- CLT anual = 12 x liquido mensal + 13o liquido + 1/3 de ferias liquido + FGTS depositado + beneficios + PLR liquida.
- PJ anual = meses faturados x (faturamento - DAS - INSS/IRRF do pro-labore - custos fixos).
- **Reservas do PJ (ferias, 13o, "FGTS", emergencia) sao poupanca do proprio PJ, nao custo.** Se o lado CLT ja soma 13o/ferias/FGTS como ganho, descontar reservas equivalentes do PJ conta o mesmo direito duas vezes. Reservas servem para exibir "quanto separar por mes", nao para reduzir o anual.
- Meses sem faturamento (`paidMonthsPerYear < 12`) ja representam ferias nao remuneradas; nao somar com reserva de ferias.
- Custos fixos do PJ (contador, plano de saude, DAS minimo) correm 12 meses, mesmo com menos meses faturados.
- Margem de risco e aplicada **sobre o valor PJ de empate**: recomendado = empate x (1 + margem). Baixo 10%, medio 20% (-3 p.p. por aviso >= 30 dias, pausa remunerada e outros clientes; +5 p.p. por exclusividade), alto 30%. Nunca multiplicar o anual CLT inteiro pela margem.
- Faixas de sanidade: empate entre 1,0x e 1,7x o bruto CLT (sem beneficios fica perto de 1,1x; beneficios e meses sem faturar sobem o valor); recomendado ate ~2,0x.
- Fator R exatamente 28% precisa de tolerancia de ponto flutuante, senao cai no Anexo V.

## CLT

- **INSS empregado**: progressivo por faixa, teto anual (tabela `inssEmployee2026`). Atualizar todo janeiro (portaria interministerial MPS/MF).
- **IRRF mensal** (tabela vigente desde mai/2025 + Lei 15.270/2025 a partir de jan/2026):
  - Base = rendimento tributavel - **maior entre** (INSS + R$ 189,59 x dependentes) **e** desconto simplificado mensal de R$ 607,20.
  - Reducao Lei 15.270: rendimento tributavel bruto ate R$ 5.000 -> reducao ate R$ 312,89 (zera o imposto); de R$ 5.000,01 a R$ 7.350 -> reducao = 978,62 - 0,133145 x rendimento **bruto**; acima disso, sem reducao. A reducao usa o rendimento bruto, nao a base apos deducoes. Confirmar leitura com contador antes de publicar.
  - Valores de referencia: bruto 5.000 -> IRRF 0; bruto 7.000 -> R$ 754,75; bruto 10.000 -> R$ 1.569,55 (cobertos em `values_test.go`).
  - Hoje o 13o usa a mesma funcao (desconto simplificado + reducao). Confirmar com contador se ambos valem para tributacao exclusiva do 13o.
- **13o**: tributacao exclusiva na fonte (INSS e IRRF proprios, separados do salario do mes).
- **Ferias**: 1/3 constitucional e o ganho extra; os 30 dias ja estao nos 12 salarios. IR das ferias e calculado em separado no mes do pagamento.
- **FGTS**: 8% sobre salario, 13o e ferias+1/3. Nao e dinheiro livre (saque em demissao sem justa causa, compra de imovel, aposentadoria, saque-aniversario). Exibir separado do liquido.
- **Multa 40%**: incide sobre o saldo total do FGTS so em demissao sem justa causa. Tratar como valor esperado (probabilidade x multa), nunca como renda certa.
- **Bonus** (`annualBonus`): tributado como salario no mes em que entra (INSS e IRRF incrementais) e soma na base do FGTS.
- **PLR** (`annualPlr`): tabela exclusiva anual (`plrExclusive2026`, isenta ate R$ 8.214,40), sem INSS nem FGTS. Tabela tirada de fonte secundaria; conferir com a Receita.
- **Nao modelado ainda** (pedir ou explicar): aviso previo proporcional (30 + 3 dias/ano, Lei 12.506/2011), seguro-desemprego, plano de saude pago pela empresa (valor de mercado), VT (desconto de ate 6%), previdencia privada com contrapartida.

## PJ

- **MEI**: teto R$ 81 mil/ano e nao permite atividades intelectuais (dev, consultoria, design na maioria dos CNAEs). Nao sugerir MEI para o publico principal.
- **Simples Nacional**, servicos intelectuais:
  - Fator R = folha 12m (pro-labore + encargos) / receita bruta 12m. **>= 28% -> Anexo III** (a partir de 6%); **< 28% -> Anexo V** (a partir de 15,5%).
  - Aliquota efetiva = (RBT12 x aliquota nominal - parcela a deduzir) / RBT12. Tabelas `simpleAnexoIII` e `simpleAnexoV`. ISS e CPP ja estao dentro do DAS.
  - Empresa nova: RBT12 proporcional (receita media x 12) nos primeiros meses.
  - Teto do Simples: R$ 4,8 mi/ano.
- **Pro-labore**: socio contribuinte individual paga INSS de 11% (limitado ao teto) quando a empresa esta no Simples Anexo III/V; IRRF pela tabela mensal. Valor otimo costuma ser 28% do faturamento para fechar Fator R, respeitando o salario minimo como piso.
- **Lucro distribuido**: isento ate R$ 50 mil/mes por empresa para a mesma pessoa; acima disso, retencao de 10% (Lei 15.270/2025) e possivel tributacao minima anual (IRPFM) para renda acima de R$ 600 mil/ano. Relevante so para alta renda; avisar no resultado.
- **Lucro Presumido**: servicos com presuncao de 32% -> ~13,33% + ISS (2% a 5%) + 20% de INSS patronal sobre pro-labore. Hoje nao modelado; entra quando o Anexo V ficar pior que Presumido.
- **Reforma tributaria (IBS/CBS)**: transicao a partir de 2026/2027; Simples continua, com opcao de regime hibrido. Revisar regras antes de cada janeiro.

## Risco juridico (pejotizacao)

Vinculo de emprego existe quando ha, juntos: pessoalidade, habitualidade, onerosidade e subordinacao (CLT art. 3o). Contrato PJ com esses elementos e nulo como fraude (CLT art. 9o). Sinais que devem aumentar o premio e gerar alerta: horario controlado, chefe direto, proibicao de substituicao, exclusividade, ferramentas/e-mail corporativo obrigatorios, metas de empregado, ex-CLT recontratado como PJ para a mesma funcao.

O STF suspendeu processos sobre pejotizacao (Tema 1389, 2025) para julgar competencia e onus da prova. Verificar o status do julgamento antes de escrever qualquer texto juridico no produto.

## Limites do produto

- Resultado e simulacao educativa; nao e consultoria contabil nem juridica. Toda tela de resultado deve dizer isso e mostrar as premissas usadas.
- Analise de contrato por IA, vendida como servico, pode ser lida como consultoria juridica (Lei 8.906/94, art. 1o, II). Posicionar como "checklist de pontos para levar ao advogado", sem parecer.
- Salario e dado pessoal (LGPD). Calculos salvos precisam de base legal, politica de privacidade, retencao definida e exclusao a pedido.

## Atualizacao anual (checklist de janeiro)

1. Salario minimo e tabela INSS do ano -> `inssEmployee2026` e piso/teto em `calculateIndividualINSS`.
2. Tabela IRRF, deducao por dependente, desconto simplificado e faixas da Lei 15.270.
3. Tabelas do Simples (LC 123/2006, anexos) e mudancas da reforma tributaria.
4. Renomear tabelas para o ano, ajustar testes de referencia, incrementar `calculation_version`.
