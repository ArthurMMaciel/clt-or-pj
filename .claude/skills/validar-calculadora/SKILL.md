---
name: validar-calculadora
description: Valida mudancas no motor de calculo CLT x PJ antes de commitar - roda os testes Go, confere cenarios de referencia com faixas de sanidade e checa se landing/textos do front batem com o motor. Use apos qualquer alteracao em backend/internal/calculator, nos defaults do formulario (CalculatorPage.tsx) ou nos numeros de exemplo da LandingPage.
---

# Validar calculadora

Regras de negocio: ver a skill `regras-clt-pj`.

## 1. Testes

Windows, Go fora do PATH:

```powershell
cd backend
& 'C:\Program Files\Go\bin\go.exe' test ./internal/calculator/ -v
```

## 2. Cenarios de referencia

Os valores esperados ficam em `internal/calculator/values_test.go`. Ao mexer em regra, recalcular a mao e atualizar o teste correspondente:

| Cenario | Esperado |
|---|---|
| CLT bruto 5.000, sem dependentes | IRRF 0 (Lei 15.270) |
| CLT bruto 7.000 | INSS 781,51; IRRF 754,75 |
| CLT bruto 10.000 | INSS 988,09; IRRF 1.569,55 |
| PJ 15.000, Fator R 28%, RBT12 180.000 | Anexo III, aliquota efetiva 6% |
| PJ com pro-labore < 28% | Anexo V |

Faixas de sanidade (falha = investigar, nao ajustar o teste):

- CLT -> PJ, empate: entre 1,0x e 1,7x o bruto CLT com 13o, ferias e FGTS marcados.
- CLT -> PJ, recomendado com risco: no maximo ~2,0x o bruto CLT.
- PJ -> CLT -> PJ (ida e volta) deve voltar perto do valor original.
- Zerar reservas do PJ nao pode mudar o anual PJ (reservas sao poupanca, nao custo).

Para explorar um cenario rapido, criar um `_test.go` temporario em `internal/calculator` chamando `Compare`/`CLTToPJ`/`PJToCLT` com `fmt.Printf`, rodar com `-run` e apagar o arquivo depois.

## 3. Consistencia com o front

- `frontend/src/pages/LandingPage.tsx` tem numeros de exemplo fixos (CLT 10 mil x PJ 15 mil). Rodar o mesmo cenario no motor e atualizar o texto, ou remover os numeros.
- `defaultPJAssumptions()` em `CalculatorPage.tsx` define premissas invisiveis no modo CLT -> PJ. Se mudar, o resultado precisa mostrar essas premissas.
- Campos novos em `types.go` precisam existir em `frontend/src/lib/api.ts` (`CLTPayload`/`PJPayload`/`MoneyBreakdown`).

## 4. Antes de commitar

- Incrementar `Version` em `backend/internal/calculator/calculator.go` se algum resultado mudou.
- Frontend compila: `cd frontend; npm.cmd run build`.
