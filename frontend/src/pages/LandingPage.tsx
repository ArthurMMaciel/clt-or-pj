import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Calculator,
  Check,
  CreditCard,
  FileText,
  Lock,
  MessageSquareText,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";

const checkoutUrl = import.meta.env.VITE_BASIC_PLAN_CHECKOUT_URL as string | undefined;

const activePlanTarget = checkoutUrl?.trim() || "/calculadora";

export function LandingPage() {
  return (
    <div className="-mt-2">
      <section className="grid min-h-[calc(100vh-112px)] items-center gap-10 pb-10 lg:grid-cols-[1.04fr_0.96fr]">
        <div className="max-w-2xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-mint/20 bg-mint/10 px-3 py-1 text-sm font-semibold text-mint">
            <BadgeCheck size={16} />
            Simulador financeiro para decisões CLT ou PJ
          </div>
          <h1 className="text-4xl font-semibold leading-tight tracking-normal text-ink sm:text-5xl">
            Entenda se uma proposta PJ compensa antes de aceitar.
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-ink/68">
            Compare salário, benefícios, impostos, reservas, FGTS, férias, 13º e risco contratual em uma visão anual
            simples de defender.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              to="/calculadora"
              className="inline-flex items-center gap-2 rounded-md bg-mint px-5 py-3 font-semibold text-white hover:bg-mint/90"
            >
              Usar calculadora
              <ArrowRight size={18} />
            </Link>
            <a
              href="#planos"
              className="inline-flex items-center gap-2 rounded-md border border-ink/15 bg-white px-5 py-3 font-semibold text-ink hover:bg-ink/5"
            >
              Ver planos
            </a>
          </div>
          <div className="mt-8 grid gap-3 text-sm text-ink/65 sm:grid-cols-3">
            <ProofItem label="CLT x PJ lado a lado" />
            <ProofItem label="Equivalência CLT para PJ" />
            <ProofItem label="Equivalência PJ para CLT" />
          </div>
        </div>

        <div className="rounded-lg border border-ink/10 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-ink/55">Exemplo de comparação</p>
              <h2 className="mt-1 text-xl font-semibold">CLT R$ 10 mil x PJ R$ 15 mil</h2>
            </div>
            <div className="grid h-11 w-11 place-items-center rounded-lg bg-lime text-ink">
              <BarChart3 size={22} />
            </div>
          </div>
          <div className="grid gap-3">
            <PreviewMetric label="Pacote anual CLT" value="R$ 126.101" />
            <PreviewMetric label="Pacote anual PJ" value="R$ 152.256" highlight />
            <PreviewMetric label="PJ mínimo para empatar" value="R$ 12.681/mês" />
            <PreviewMetric label="PJ recomendado com margem de risco" value="R$ 14.076/mês" />
          </div>
          <p className="mt-3 text-xs leading-5 text-ink/55">
            Cenário: CLT de R$ 10.000 brutos + R$ 1.000 em benefícios, com 13º, férias + 1/3, FGTS e multa de 40%. PJ
            de R$ 15.000 no Simples Anexo III (Fator R 28%, pró-labore de R$ 4.200), contador R$ 250, plano de saúde
            R$ 700, 12 meses faturados, aviso de 30 dias, pausa remunerada e outros clientes permitidos (margem de risco
            de 11%). São os valores que já vêm preenchidos na calculadora. Simulação educativa, sem valor de
            consultoria.
          </p>
          <div className="mt-5 rounded-lg bg-paper p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <ShieldCheck size={17} />
              O que entra na conta
            </div>
            <div className="grid gap-2 text-sm text-ink/65 sm:grid-cols-2">
              <ProofItem label="Impostos e INSS" compact />
              <ProofItem label="Férias e 13º" compact />
              <ProofItem label="Fator R" compact />
              <ProofItem label="Margem de risco" compact />
            </div>
          </div>
        </div>
      </section>

      <section id="planos" className="border-t border-ink/10 py-12">
        <div className="mb-7 max-w-2xl">
          <h2 className="text-2xl font-semibold">Planos para liberar o produto com clareza</h2>
          <p className="mt-2 text-ink/65">
            O primeiro plano deve vender mais cálculos e comparações. O plano com IA e chats fica visível para gerar
            demanda, mas sem clique até a entrega estar pronta.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <article className="rounded-lg border-2 border-mint bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.14em] text-mint">Liberado agora</p>
                <h3 className="mt-2 text-2xl font-semibold">Essencial</h3>
                <p className="mt-2 text-sm leading-6 text-ink/65">
                  Para quem quer fazer mais cálculos e comparar propostas sem depender de planilha.
                </p>
              </div>
              <Calculator className="text-mint" size={26} />
            </div>
            <div className="mt-5 flex items-end gap-2">
              <strong className="text-3xl">R$ 19</strong>
              <span className="pb-1 text-sm text-ink/50">/mês</span>
            </div>
            <ul className="mt-5 grid gap-3 text-sm text-ink/70">
              <PlanFeature label="Cálculos e comparações extras" />
              <PlanFeature label="CLT para PJ e PJ para CLT" />
              <PlanFeature label="Detalhamento anual da decisão" />
              <PlanFeature label="Histórico quando autenticado" />
            </ul>
            {checkoutUrl ? (
              <a
                href={activePlanTarget}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-md bg-mint px-4 py-3 font-semibold text-white hover:bg-mint/90"
              >
                Assinar Essencial
                <CreditCard size={18} />
              </a>
            ) : (
              <Link
                to={activePlanTarget}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-md bg-mint px-4 py-3 font-semibold text-white hover:bg-mint/90"
              >
                Começar pelo Essencial
                <ArrowRight size={18} />
              </Link>
            )}
          </article>

          <article className="relative rounded-lg border border-ink/10 bg-white p-5 opacity-75 shadow-sm">
            <div className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-ink/8 px-3 py-1 text-xs font-semibold text-ink/60">
              <Lock size={13} />
              Em breve
            </div>
            <div className="flex items-start gap-4 pr-24">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.14em] text-ink/40">Travado</p>
                <h3 className="mt-2 text-2xl font-semibold">IA e chats</h3>
                <p className="mt-2 text-sm leading-6 text-ink/60">
                  Análise de contratos, perguntas em chat e alertas de cláusulas. Ainda não liberado para compra.
                </p>
              </div>
              <Sparkles className="shrink-0 text-ink/35" size={26} />
            </div>
            <ul className="mt-5 grid gap-3 text-sm text-ink/55">
              <PlanFeature label="Chat especialista CLT ou PJ" />
              <PlanFeature label="Triagem de contrato PJ" />
              <PlanFeature label="Alertas de risco e próximos passos" />
              <PlanFeature label="Histórico de conversas" />
            </ul>
            <button
              type="button"
              className="mt-6 inline-flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-md border border-ink/10 bg-ink/5 px-4 py-3 font-semibold text-ink/45"
              disabled
            >
              IA será liberada em breve
              <MessageSquareText size={18} />
            </button>
          </article>
        </div>

        <div className="mt-5 rounded-lg border border-ink/10 bg-white p-4 text-sm leading-6 text-ink/65">
          <div className="mb-1 flex items-center gap-2 font-semibold text-ink">
            <CreditCard size={17} />
            Pagamento recomendado para produção
          </div>
          Use Mercado Pago no primeiro lançamento: Checkout Pro ou Assinaturas para Pix, cartão e boleto no Brasil,
          com webhook no backend para liberar o plano Essencial após pagamento aprovado.
        </div>
      </section>

      <section className="grid gap-4 border-t border-ink/10 py-12 md:grid-cols-3">
        <Feature icon={Calculator} title="Comparação completa" text="Veja CLT e PJ pelo pacote anual, não só pelo líquido mensal." />
        <Feature icon={FileText} title="Decisão documentada" text="Resumo, métricas e motivos para negociar com mais segurança." />
        <Feature icon={ShieldCheck} title="Pronto para evoluir" text="Base preparada para autenticação, histórico, cobrança e liberação de plano." />
      </section>
    </div>
  );
}

function ProofItem({ label, compact = false }: { label: string; compact?: boolean }) {
  return (
    <div className={`flex items-center gap-2 ${compact ? "" : "font-medium"}`}>
      <Check className="shrink-0 text-mint" size={16} />
      <span>{label}</span>
    </div>
  );
}

function PreviewMetric({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-md border border-ink/10 p-3">
      <span className="text-sm text-ink/60">{label}</span>
      <strong className={highlight ? "text-mint" : "text-ink"}>{value}</strong>
    </div>
  );
}

function PlanFeature({ label }: { label: string }) {
  return (
    <li className="flex items-center gap-2">
      <Check className="shrink-0 text-mint" size={16} />
      {label}
    </li>
  );
}

function Feature({
  icon: Icon,
  title,
  text,
}: {
  icon: typeof Calculator;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-lg border border-ink/10 bg-white p-5">
      <Icon className="text-mint" size={23} />
      <h3 className="mt-4 font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-ink/62">{text}</p>
    </div>
  );
}
