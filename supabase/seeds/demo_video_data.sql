create extension if not exists pgcrypto;

-- Usuario para gravacao:
-- email: demo@cltoupj.com
-- senha: Demo@123456
insert into public.app_users (
  id,
  name,
  email,
  password_hash,
  role,
  email_confirmed_at,
  created_at,
  updated_at
)
values (
  '11111111-1111-4111-8111-111111111111',
  'Usuario Demo',
  'demo@cltoupj.com',
  crypt('Demo@123456', gen_salt('bf', 10)),
  'user',
  now() - interval '2 days',
  now() - interval '2 days',
  now() - interval '2 days'
)
on conflict (email) do update set
  name = excluded.name,
  password_hash = excluded.password_hash,
  role = excluded.role,
  email_confirmed_at = excluded.email_confirmed_at,
  updated_at = now();

-- Usuario pendente para demonstrar quem recebeu email e ainda nao confirmou.
insert into public.app_users (
  id,
  name,
  email,
  password_hash,
  role,
  email_confirmed_at,
  created_at,
  updated_at
)
values (
  '22222222-2222-4222-8222-222222222222',
  'Usuario Aguardando Confirmacao',
  'pendente@cltoupj.com',
  crypt('Pendente@123456', gen_salt('bf', 10)),
  'user',
  null,
  now() - interval '1 day',
  now() - interval '1 day'
)
on conflict (email) do update set
  name = excluded.name,
  password_hash = excluded.password_hash,
  role = excluded.role,
  email_confirmed_at = null,
  updated_at = now();

insert into public.auth_tokens (
  id,
  user_id,
  purpose,
  token_hash,
  expires_at,
  used_at,
  created_at
)
values (
  '33333333-3333-4333-8333-333333333333',
  '22222222-2222-4222-8222-222222222222',
  'email_confirmation',
  encode(digest('token-demo-confirmacao-pendente', 'sha256'), 'hex'),
  now() + interval '7 days',
  null,
  now() - interval '1 day'
)
on conflict (id) do update set
  expires_at = excluded.expires_at,
  used_at = null;

insert into public.email_events (
  id,
  user_id,
  email,
  event_type,
  provider,
  provider_message_id,
  metadata,
  created_at
)
values
  (
    '44444444-4444-4444-8444-444444444441',
    '11111111-1111-4111-8111-111111111111',
    'demo@cltoupj.com',
    'confirmation_sent',
    'seed',
    'seed-confirmed-user',
    '{"context":"demo_video"}'::jsonb,
    now() - interval '2 days'
  ),
  (
    '44444444-4444-4444-8444-444444444442',
    '11111111-1111-4111-8111-111111111111',
    'demo@cltoupj.com',
    'confirmation_confirmed',
    'seed',
    'seed-confirmed-user',
    '{"context":"demo_video"}'::jsonb,
    now() - interval '2 days' + interval '10 minutes'
  ),
  (
    '44444444-4444-4444-8444-444444444443',
    '22222222-2222-4222-8222-222222222222',
    'pendente@cltoupj.com',
    'confirmation_sent',
    'seed',
    'seed-pending-user',
    '{"context":"demo_video","status":"waiting_confirmation"}'::jsonb,
    now() - interval '1 day'
  )
on conflict (id) do update set
  user_id = excluded.user_id,
  email = excluded.email,
  event_type = excluded.event_type,
  provider = excluded.provider,
  provider_message_id = excluded.provider_message_id,
  metadata = excluded.metadata,
  created_at = excluded.created_at;

insert into public.calculations (
  id,
  user_id,
  type,
  input_json,
  result_json,
  recommendation,
  calculation_version,
  created_at
)
values
  (
    '55555555-5555-4555-8555-555555555551',
    '11111111-1111-4111-8111-111111111111',
    'compare',
    '{
      "clt": {
        "grossSalary": 12000,
        "monthlyBenefits": 1200,
        "monthlyTaxableBenefits": 0,
        "monthlyDiscounts": 0,
        "annualBonus": 8000,
        "dependents": 0,
        "includeFgts": true,
        "includeThirteenth": true,
        "includeVacation": true,
        "includeTerminationProtection": true
      },
      "pj": {
        "monthlyRate": 18000,
        "taxRegime": "auto",
        "effectiveTaxRate": 0.06,
        "grossRevenueLast12Months": 216000,
        "payrollLast12Months": 60480,
        "proLabore": 5040,
        "proLaboreRate": 0.28,
        "paidMonthsPerYear": 12,
        "monthlyAccountingCost": 300,
        "monthlyHealthPlanCost": 900,
        "otherMonthlyCosts": 250,
        "vacationReserveRate": 0.0833,
        "thirteenthReserveRate": 0.0833,
        "fgtsReserveRate": 0.08,
        "emergencyReserveRate": 0.1,
        "contractRisk": "medium",
        "noticeDays": 30,
        "hasPaidVacation": false,
        "allowsOtherClients": true,
        "requiresExclusivity": false
      }
    }'::jsonb,
    '{
      "summary": "PJ fica financeiramente melhor neste cenario, mesmo considerando impostos, custos e reservas.",
      "monthlyDifference": 2400,
      "annualDifference": 28800,
      "minimumPjToBreakEven": 15400,
      "minimumPjRecommended": 17250,
      "recommendedOption": "pj",
      "reasons": [
        "Valor PJ supera o pacote anual CLT.",
        "Reservas e custos foram considerados.",
        "Risco contratual medio exige premio adicional."
      ]
    }'::jsonb,
    'pj',
    'demo-seed-1',
    now() - interval '3 hours'
  ),
  (
    '55555555-5555-4555-8555-555555555552',
    '11111111-1111-4111-8111-111111111111',
    'clt_to_pj',
    '{
      "clt": {
        "grossSalary": 15000,
        "monthlyBenefits": 1500,
        "monthlyTaxableBenefits": 0,
        "monthlyDiscounts": 0,
        "annualBonus": 12000,
        "dependents": 1,
        "includeFgts": true,
        "includeThirteenth": true,
        "includeVacation": true,
        "includeTerminationProtection": true
      },
      "pj": {
        "monthlyRate": 1,
        "taxRegime": "auto",
        "effectiveTaxRate": 0.06,
        "grossRevenueLast12Months": 0,
        "payrollLast12Months": 0,
        "proLabore": 0,
        "proLaboreRate": 0.28,
        "paidMonthsPerYear": 12,
        "monthlyAccountingCost": 300,
        "monthlyHealthPlanCost": 900,
        "otherMonthlyCosts": 200,
        "vacationReserveRate": 0.0833,
        "thirteenthReserveRate": 0.0833,
        "fgtsReserveRate": 0.08,
        "emergencyReserveRate": 0.1,
        "contractRisk": "medium",
        "noticeDays": 30,
        "hasPaidVacation": false,
        "allowsOtherClients": true,
        "requiresExclusivity": false
      }
    }'::jsonb,
    '{
      "summary": "Para substituir esta proposta CLT, o PJ recomendado precisa considerar reservas, plano de saude e premio de risco.",
      "equivalentValue": 22000,
      "recommendedValue": 24600,
      "minimumBreakEven": 22000,
      "minimumPjToBreakEven": 22000,
      "minimumPjRecommended": 24600,
      "recommendedOption": "neutral",
      "reasons": [
        "CLT possui beneficios e protecoes relevantes.",
        "PJ precisa compensar ausencia de 13o, ferias e FGTS.",
        "Valor recomendado inclui margem para risco contratual."
      ]
    }'::jsonb,
    'neutral',
    'demo-seed-1',
    now() - interval '2 hours'
  ),
  (
    '55555555-5555-4555-8555-555555555553',
    '11111111-1111-4111-8111-111111111111',
    'pj_to_clt',
    '{
      "pj": {
        "monthlyRate": 24000,
        "taxRegime": "auto",
        "effectiveTaxRate": 0.06,
        "grossRevenueLast12Months": 288000,
        "payrollLast12Months": 80640,
        "proLabore": 6720,
        "proLaboreRate": 0.28,
        "paidMonthsPerYear": 12,
        "monthlyAccountingCost": 350,
        "monthlyHealthPlanCost": 1000,
        "otherMonthlyCosts": 300,
        "vacationReserveRate": 0.0833,
        "thirteenthReserveRate": 0.0833,
        "fgtsReserveRate": 0.08,
        "emergencyReserveRate": 0.1,
        "contractRisk": "high",
        "noticeDays": 15,
        "hasPaidVacation": false,
        "allowsOtherClients": false,
        "requiresExclusivity": true
      }
    }'::jsonb,
    '{
      "summary": "Este contrato PJ se aproxima de uma proposta CLT alta quando o risco, exclusividade e custos sao considerados.",
      "equivalentValue": 17500,
      "recommendedValue": 17500,
      "minimumBreakEven": 17500,
      "recommendedOption": "neutral",
      "reasons": [
        "Exclusividade aumenta o risco do contrato PJ.",
        "Custos e reservas reduzem o liquido real.",
        "CLT equivalente ajuda a comparar uma contraproposta."
      ]
    }'::jsonb,
    'neutral',
    'demo-seed-1',
    now() - interval '1 hour'
  )
on conflict (id) do update set
  user_id = excluded.user_id,
  type = excluded.type,
  input_json = excluded.input_json,
  result_json = excluded.result_json,
  recommendation = excluded.recommendation,
  calculation_version = excluded.calculation_version,
  created_at = excluded.created_at;
