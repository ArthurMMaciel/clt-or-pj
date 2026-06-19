import {
  AlertTriangle,
  Bot,
  CheckCircle2,
  ChevronRight,
  FileSearch,
  FileText,
  Loader2,
  MessageSquareText,
  Paperclip,
  Plus,
  Send,
  ShieldCheck,
  Sparkles,
  User,
  X,
} from "lucide-react";
import { useMemo, useRef, useState, type FormEvent } from "react";

import {
  analyzeContract,
  answerContractQuestion,
  type ContractAnalysis,
  type ContractFinding,
} from "../lib/contractIntelligence";

type Message = {
  id: number;
  role: "assistant" | "user";
  content: string;
};

const initialMessages: Message[] = [
  {
    id: 1,
    role: "assistant",
    content:
      "Olá, Arthur. Eu sou a assistente demonstrativa do CLT ou PJ. Posso explicar uma proposta, comparar riscos e analisar cláusulas de um contrato. Para uma análise específica, anexe um PDF, DOCX ou TXT.",
  },
];

const conversationHistory = [
  { title: "Proposta PJ de R$ 15 mil", subtitle: "Hoje", active: true },
  { title: "Comparação com benefícios", subtitle: "12 jun", active: false },
  { title: "Contrato Tech Solutions", subtitle: "8 jun", active: false },
];

const suggestions = [
  "CLT ou PJ: qual faz mais sentido?",
  "Quais riscos devo olhar no contrato?",
  "Como o Fator R muda a conta?",
];

export function ConversationsPage() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [analysis, setAnalysis] = useState<ContractAnalysis | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isReading, setIsReading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const criticalCount = useMemo(
    () => analysis?.findings.filter((finding) => finding.severity === "high").length ?? 0,
    [analysis],
  );

  function sendMessage(content: string) {
    const trimmed = content.trim();
    if (!trimmed) return;

    setMessages((current) => [
      ...current,
      { id: Date.now(), role: "user", content: trimmed },
      { id: Date.now() + 1, role: "assistant", content: answerContractQuestion(trimmed, analysis) },
    ]);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    sendMessage(String(form.get("message") || ""));
    event.currentTarget.reset();
  }

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setIsReading(true);
    setError(null);
    setFileName(file.name);

    try {
      const { extractContractText } = await import("../lib/documentReader");
      const text = await extractContractText(file);
      if (text.trim().length < 80) {
        throw new Error("Não consegui extrair texto suficiente. O PDF pode ser apenas uma imagem.");
      }
      const result = analyzeContract(text, file.name);
      setAnalysis(result);
      setShowAnalysis(true);
      setMessages((current) => [
        ...current,
        {
          id: Date.now(),
          role: "assistant",
          content: `Terminei a triagem de ${file.name}. ${result.summary} Identifiquei ${result.findings.length} pontos e atribuí um índice demonstrativo de clareza e proteção de ${result.score}/100.`,
        },
      ]);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Não foi possível ler o arquivo.");
      setFileName(null);
    } finally {
      setIsReading(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  }

  function loadDemoContract() {
    const demoText = `
      CONTRATO DE PRESTAÇÃO DE SERVIÇOS
      A CONTRATADA prestará serviços de desenvolvimento de software pelo valor de R$ 15.000,00 mensais,
      mediante emissão de nota fiscal. A prestação ocorrerá em horário fixo de 9h às 18h, com supervisor direto,
      exigindo exclusividade e vedada a substituição do profissional. O contrato poderá ser rescindido com aviso
      prévio de 15 dias. A CONTRATADA cede integralmente toda propriedade intelectual e responderá por multas e
      indenizações. As partes observarão confidencialidade e LGPD. Não há cláusula de reajuste.
    `;
    const result = analyzeContract(demoText, "contrato-pj-demo.pdf");
    setFileName(result.fileName);
    setAnalysis(result);
    setShowAnalysis(true);
    setMessages((current) => [
      ...current,
      {
        id: Date.now(),
        role: "assistant",
        content: `Carreguei um contrato PJ demonstrativo. ${result.summary} Use as perguntas rápidas ou pergunte sobre uma cláusula específica.`,
      },
    ]);
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-sm">
      <div className="grid min-h-[720px] lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="hidden border-r border-ink/10 bg-ink p-4 text-white lg:block">
          <button
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-lime px-3 py-2.5 text-sm font-semibold text-ink transition hover:bg-lime/90"
            onClick={() => {
              setMessages(initialMessages);
              setAnalysis(null);
              setFileName(null);
              setShowAnalysis(false);
            }}
          >
            <Plus size={17} />
            Nova conversa
          </button>

          <p className="mb-2 mt-6 px-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/45">
            Suas conversas
          </p>
          <div className="grid gap-1">
            {conversationHistory.map((conversation) => (
              <button
                key={conversation.title}
                className={`rounded-lg px-3 py-3 text-left ${
                  conversation.active ? "bg-white/10" : "text-white/65 hover:bg-white/5"
                }`}
              >
                <span className="block truncate text-sm font-medium">{conversation.title}</span>
                <span className="mt-1 block text-xs text-white/40">{conversation.subtitle}</span>
              </button>
            ))}
          </div>

          <div className="mt-8 rounded-xl border border-white/10 bg-white/5 p-3 text-xs leading-5 text-white/55">
            <ShieldCheck className="mb-2 text-lime" size={18} />
            Demo educativa. Valide decisões com profissionais habilitados.
          </div>
        </aside>

        <div className={`grid min-w-0 ${showAnalysis && analysis ? "xl:grid-cols-[minmax(0,1fr)_390px]" : ""}`}>
          <div className="flex min-w-0 flex-col">
            <header className="flex items-center justify-between border-b border-ink/10 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-mint text-white">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h1 className="font-semibold">Especialista CLT ou PJ</h1>
                  <p className="text-xs text-ink/55">Simulação de IA • regras e parâmetros de 2026</p>
                </div>
              </div>
              {analysis ? (
                <button
                  className="inline-flex items-center gap-2 rounded-lg border border-ink/10 px-3 py-2 text-sm font-medium hover:bg-paper"
                  onClick={() => setShowAnalysis((current) => !current)}
                >
                  <FileSearch size={17} />
                  <span className="hidden sm:inline">Análise</span>
                  {criticalCount > 0 ? (
                    <span className="grid h-5 min-w-5 place-items-center rounded-full bg-clay px-1 text-[11px] text-white">
                      {criticalCount}
                    </span>
                  ) : null}
                </button>
              ) : null}
            </header>

            <div className="flex-1 space-y-5 overflow-y-auto bg-[#fbfaf6] p-5 sm:p-7">
              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}

              {!analysis ? (
                <div className="ml-12 rounded-xl border border-dashed border-mint/40 bg-white p-4">
                  <div className="flex gap-3">
                    <FileText className="mt-0.5 shrink-0 text-mint" size={21} />
                    <div>
                      <p className="text-sm font-semibold">Quer analisar um contrato?</p>
                      <p className="mt-1 text-xs leading-5 text-ink/55">
                        O documento é processado no seu navegador nesta demonstração.
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button
                          className="rounded-md bg-ink px-3 py-2 text-xs font-semibold text-white"
                          onClick={() => fileInput.current?.click()}
                        >
                          Escolher arquivo
                        </button>
                        <button
                          className="rounded-md border border-ink/15 px-3 py-2 text-xs font-semibold hover:bg-paper"
                          onClick={loadDemoContract}
                        >
                          Usar contrato de exemplo
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}

              <div className="ml-12 flex flex-wrap gap-2">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    className="rounded-full border border-ink/10 bg-white px-3 py-2 text-xs text-ink/70 transition hover:border-mint hover:text-mint"
                    onClick={() => sendMessage(suggestion)}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t border-ink/10 bg-white p-4">
              {error ? (
                <div className="mb-3 flex items-start justify-between rounded-lg bg-clay/10 px-3 py-2 text-xs text-clay">
                  <span>{error}</span>
                  <button onClick={() => setError(null)} aria-label="Fechar erro">
                    <X size={15} />
                  </button>
                </div>
              ) : null}

              {fileName ? (
                <div className="mb-3 flex w-fit items-center gap-2 rounded-lg bg-mint/10 px-3 py-2 text-xs font-medium text-mint">
                  <FileText size={15} />
                  <span className="max-w-[260px] truncate">{fileName}</span>
                  {analysis ? <CheckCircle2 size={14} /> : null}
                </div>
              ) : null}

              <form onSubmit={handleSubmit} className="flex items-end gap-2 rounded-xl border border-ink/15 p-2 focus-within:border-mint focus-within:ring-2 focus-within:ring-mint/10">
                <input
                  ref={fileInput}
                  className="hidden"
                  type="file"
                  accept=".pdf,.docx,.txt,.md"
                  onChange={(event) => void handleFile(event.target.files?.[0])}
                />
                <button
                  type="button"
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-lg text-ink/50 hover:bg-paper hover:text-ink"
                  onClick={() => fileInput.current?.click()}
                  disabled={isReading}
                  aria-label="Anexar contrato"
                >
                  {isReading ? <Loader2 className="animate-spin" size={19} /> : <Paperclip size={19} />}
                </button>
                <textarea
                  name="message"
                  rows={1}
                  className="max-h-28 min-h-10 flex-1 resize-none border-0 bg-transparent px-2 py-2.5 text-sm outline-none"
                  placeholder="Pergunte sobre CLT, PJ ou uma cláusula..."
                />
                <button
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-mint text-white hover:bg-mint/90"
                  aria-label="Enviar mensagem"
                >
                  <Send size={18} />
                </button>
              </form>
              <p className="mt-2 text-center text-[10px] text-ink/40">
                Resultado educativo e demonstrativo. Não substitui advogado, contador ou consultor financeiro.
              </p>
            </div>
          </div>

          {showAnalysis && analysis ? <AnalysisPanel analysis={analysis} onClose={() => setShowAnalysis(false)} /> : null}
        </div>
      </div>
    </section>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const isAssistant = message.role === "assistant";
  return (
    <div className={`flex gap-3 ${isAssistant ? "" : "justify-end"}`}>
      {isAssistant ? (
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-mint text-white">
          <Bot size={18} />
        </div>
      ) : null}
      <div
        className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-6 ${
          isAssistant ? "rounded-tl-md border border-ink/10 bg-white text-ink/75 shadow-sm" : "rounded-tr-md bg-ink text-white"
        }`}
      >
        {message.content}
      </div>
      {!isAssistant ? (
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-lime text-ink">
          <User size={18} />
        </div>
      ) : null}
    </div>
  );
}

function AnalysisPanel({ analysis, onClose }: { analysis: ContractAnalysis; onClose: () => void }) {
  return (
    <aside className="border-l border-ink/10 bg-white">
      <div className="flex items-center justify-between border-b border-ink/10 px-5 py-4">
        <div>
          <p className="text-sm font-semibold">Análise aprofundada</p>
          <p className="mt-0.5 max-w-[260px] truncate text-xs text-ink/50">{analysis.fileName}</p>
        </div>
        <button className="rounded-md p-2 hover:bg-paper" onClick={onClose} aria-label="Fechar análise">
          <X size={18} />
        </button>
      </div>

      <div className="max-h-[655px] overflow-y-auto p-5">
        <div className="rounded-xl bg-ink p-4 text-white">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs text-white/55">Índice demonstrativo</p>
              <strong className="mt-1 block text-3xl">{analysis.score}<span className="text-base text-white/45">/100</span></strong>
            </div>
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs">{analysis.contractType}</span>
          </div>
          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-lime" style={{ width: `${analysis.score}%` }} />
          </div>
          <p className="mt-3 text-xs leading-5 text-white/65">{analysis.summary}</p>
        </div>

        <div className="mt-5">
          <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-ink/45">Dados extraídos</h2>
          <ul className="mt-2 grid gap-2">
            {analysis.extractedFacts.map((fact) => (
              <li key={fact} className="flex gap-2 text-xs leading-5 text-ink/65">
                <ChevronRight className="mt-0.5 shrink-0 text-mint" size={14} />
                {fact}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-5 grid gap-3">
          <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-ink/45">Pontos do contrato</h2>
          {analysis.findings.map((finding, index) => (
            <FindingCard key={`${finding.title}-${index}`} finding={finding} />
          ))}
        </div>

        <div className="mt-5 rounded-xl border border-mint/20 bg-mint/5 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-mint">
            <MessageSquareText size={17} />
            Próximas perguntas
          </div>
          <ul className="mt-3 grid gap-2">
            {analysis.nextQuestions.map((question) => (
              <li key={question} className="text-xs leading-5 text-ink/65">{question}</li>
            ))}
          </ul>
        </div>
      </div>
    </aside>
  );
}

function FindingCard({ finding }: { finding: ContractFinding }) {
  const styles = {
    high: { icon: AlertTriangle, color: "text-clay", background: "bg-clay/10 border-clay/20", label: "Crítico" },
    medium: { icon: AlertTriangle, color: "text-amber-700", background: "bg-amber-50 border-amber-200", label: "Atenção" },
    positive: { icon: CheckCircle2, color: "text-mint", background: "bg-mint/5 border-mint/20", label: "Positivo" },
    info: { icon: FileSearch, color: "text-blue-700", background: "bg-blue-50 border-blue-200", label: "Informação" },
  }[finding.severity];
  const Icon = styles.icon;

  return (
    <div className={`rounded-xl border p-3 ${styles.background}`}>
      <div className="flex items-start gap-2">
        <Icon className={`mt-0.5 shrink-0 ${styles.color}`} size={16} />
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs font-semibold">{finding.title}</p>
            <span className={`text-[10px] font-semibold uppercase ${styles.color}`}>{styles.label}</span>
          </div>
          <p className="mt-1 text-[11px] leading-5 text-ink/60">{finding.explanation}</p>
          {finding.evidence ? (
            <p className="mt-2 line-clamp-3 border-l-2 border-ink/10 pl-2 text-[10px] italic leading-4 text-ink/45">
              {finding.evidence}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
