import { FileClock } from "lucide-react";
import { Link } from "react-router-dom";

// Placeholder: o texto juridico definitivo depende de revisao de um advogado (LGPD, termos de uso).
// Aqui so entra o que o produto faz hoje, sem compromisso legal inventado.
const content = {
  privacy: {
    title: "Política de privacidade",
    facts: [
      "Simulações feitas sem login não são gravadas.",
      "Com login, guardamos suas simulações para montar o seu histórico.",
    ],
  },
  terms: {
    title: "Termos de uso",
    facts: [
      "Os resultados são simulações educativas com as regras de 2026.",
      "Eles não substituem a análise de um contador ou advogado.",
      "Antes de abrir empresa ou assinar contrato, confirme os números com um profissional.",
    ],
  },
};

export function LegalDraftPage({ kind }: { kind: "privacy" | "terms" }) {
  const page = content[kind];

  return (
    <article className="card mx-auto max-w-2xl p-8 sm:p-10">
      <span className="badge bg-pj-soft text-pj-ink">
        <FileClock size={14} />
        Rascunho em revisão jurídica
      </span>
      <h1 className="mt-5 text-3xl font-bold">{page.title}</h1>
      <p className="mt-3 leading-7 text-ink/65">
        O texto completo está sendo preparado com apoio jurídico. Enquanto isso, este é o funcionamento atual do produto:
      </p>
      <ul className="mt-6 grid gap-3">
        {page.facts.map((fact) => (
          <li key={fact} className="rounded-2xl bg-paper px-4 py-3 text-sm text-ink/75">
            {fact}
          </li>
        ))}
      </ul>
      <Link to="/" className="btn-secondary mt-8">
        Voltar para o início
      </Link>
    </article>
  );
}
