export type FindingSeverity = "high" | "medium" | "positive" | "info";

export type ContractFinding = {
  severity: FindingSeverity;
  category: string;
  title: string;
  explanation: string;
  evidence?: string;
};

export type ContractAnalysis = {
  fileName: string;
  contractType: "CLT" | "PJ" | "Indeterminado";
  confidence: number;
  score: number;
  summary: string;
  extractedFacts: string[];
  findings: ContractFinding[];
  nextQuestions: string[];
  text: string;
};

export function analyzeContract(text: string, fileName: string): ContractAnalysis {
  const normalized = normalize(text);
  const findings: ContractFinding[] = [];
  const extractedFacts: string[] = [];

  const pjSignals = countSignals(normalized, [
    "prestacao de servicos",
    "contratada",
    "contratante",
    "nota fiscal",
    "cnpj",
    "pro labore",
  ]);
  const cltSignals = countSignals(normalized, [
    "empregado",
    "empregador",
    "carteira de trabalho",
    "salario",
    "ferias",
    "decimo terceiro",
    "fgts",
  ]);

  const contractType = pjSignals > cltSignals ? "PJ" : cltSignals > pjSignals ? "CLT" : "Indeterminado";
  const confidence = Math.min(96, 55 + Math.abs(pjSignals - cltSignals) * 7);

  const moneyValues = text.match(/R\$\s?[\d.]+(?:,\d{2})?/gi)?.slice(0, 4) ?? [];
  if (moneyValues.length) extractedFacts.push(`Valores identificados: ${moneyValues.join(", ")}`);

  const notice = normalized.match(/aviso(?: previo)? de (\d{1,3}) dias/);
  if (notice) extractedFacts.push(`Aviso prévio/rescisão: ${notice[1]} dias`);

  const workHours = normalized.match(/(?:jornada|carga horaria).{0,35}?(\d{1,2}) horas/);
  if (workHours) extractedFacts.push(`Jornada mencionada: ${workHours[1]} horas`);

  if (hasAny(normalized, ["exclusividade", "exclusivo"])) {
    findings.push({
      severity: contractType === "PJ" ? "high" : "info",
      category: "Autonomia",
      title: "Cláusula de exclusividade",
      explanation:
        contractType === "PJ"
          ? "Exclusividade reduz a autonomia empresarial e aumenta o risco econômico e de caracterização de relação de emprego. O valor deveria incorporar esse risco."
          : "A exclusividade deve ser compatível com a função e não pode impedir atividades lícitas fora da jornada sem justificativa.",
      evidence: excerpt(text, "exclusiv"),
    });
  }

  if (hasAny(normalized, ["controle de horario", "controle de jornada", "horario fixo", "registro de ponto"])) {
    findings.push({
      severity: contractType === "PJ" ? "high" : "info",
      category: "Risco trabalhista",
      title: "Controle direto de jornada",
      explanation:
        contractType === "PJ"
          ? "Controle de horário é um sinal de subordinação. Em conjunto com pessoalidade, habitualidade e remuneração, pode indicar pejotização."
          : "O contrato deve esclarecer jornada, intervalos, banco de horas e tratamento de horas extras.",
      evidence: excerpt(text, "horario"),
    });
  }

  if (hasAny(normalized, ["subordinacao", "ordens diretas", "supervisor direto", "pessoalidade", "vedada a substituicao"])) {
    findings.push({
      severity: contractType === "PJ" ? "high" : "medium",
      category: "Risco trabalhista",
      title: "Sinais de subordinação ou pessoalidade",
      explanation:
        "A forma real de trabalho prevalece sobre o nome do contrato. A combinação de subordinação, pessoalidade, habitualidade e onerosidade exige revisão jurídica.",
      evidence: excerpt(text, hasAny(normalized, ["supervisor direto"]) ? "supervisor" : "substitu"),
    });
  }

  if (!hasAny(normalized, ["reajuste", "indice de correcao", "ipca", "igp-m"])) {
    findings.push({
      severity: "medium",
      category: "Remuneração",
      title: "Sem regra clara de reajuste",
      explanation: "Contratos longos sem índice ou data-base perdem valor real. Negocie periodicidade e índice objetivo.",
    });
  } else {
    findings.push({
      severity: "positive",
      category: "Remuneração",
      title: "Reajuste previsto",
      explanation: "Há indicação de mecanismo de atualização do valor contratual.",
      evidence: excerpt(text, "reajust"),
    });
  }

  if (!hasAny(normalized, ["aviso previo", "rescisao com antecedencia", "denuncia mediante"])) {
    findings.push({
      severity: "high",
      category: "Rescisão",
      title: "Saída sem proteção identificável",
      explanation: "Não foi localizada antecedência mínima para encerramento. Para PJ, isso exige reserva maior e prêmio de risco.",
    });
  } else {
    findings.push({
      severity: "positive",
      category: "Rescisão",
      title: "Regra de rescisão localizada",
      explanation: "O documento contém referência a aviso ou antecedência para término.",
      evidence: excerpt(text, "rescis"),
    });
  }

  if (hasAny(normalized, ["multa", "indenizacao", "responsabilidade ilimitada"])) {
    findings.push({
      severity: "medium",
      category: "Responsabilidade",
      title: "Multas ou indenizações exigem atenção",
      explanation: "Confirme teto, reciprocidade e eventos que acionam a penalidade. Responsabilidade ilimitada costuma ser desproporcional.",
      evidence: excerpt(text, hasAny(normalized, ["responsabilidade ilimitada"]) ? "responsabilidade" : "multa"),
    });
  }

  if (hasAny(normalized, ["propriedade intelectual", "cessao de direitos", "direitos autorais"])) {
    findings.push({
      severity: "medium",
      category: "Propriedade intelectual",
      title: "Cessão de propriedade intelectual",
      explanation: "A cessão deve se limitar ao que for criado no escopo, prazo e recursos do contrato, preservando conhecimento prévio e portfólio.",
      evidence: excerpt(text, "propriedade"),
    });
  }

  if (hasAny(normalized, ["lgpd", "dados pessoais", "confidencialidade"])) {
    findings.push({
      severity: "positive",
      category: "Dados e sigilo",
      title: "Proteção de dados ou confidencialidade prevista",
      explanation: "O contrato reconhece obrigações de sigilo ou tratamento de dados. Ainda é necessário verificar prazo e responsabilidades.",
      evidence: excerpt(text, hasAny(normalized, ["lgpd"]) ? "lgpd" : "confidencial"),
    });
  } else {
    findings.push({
      severity: "medium",
      category: "Dados e sigilo",
      title: "Sem cláusula de dados/sigilo identificada",
      explanation: "Se houver acesso a dados pessoais ou informação estratégica, defina finalidade, segurança, retenção e descarte.",
    });
  }

  if (contractType === "CLT" && hasAny(normalized, ["ferias", "decimo terceiro", "13º", "fgts"])) {
    findings.push({
      severity: "positive",
      category: "Direitos CLT",
      title: "Direitos trabalhistas mencionados",
      explanation: "O documento faz referência a componentes relevantes do pacote CLT.",
    });
  } else if (contractType === "PJ" && !hasAny(normalized, ["permite outros clientes", "sem exclusividade", "autonomia tecnica"])) {
    findings.push({
      severity: "medium",
      category: "Autonomia",
      title: "Autonomia comercial pouco explícita",
      explanation: "Vale registrar liberdade técnica, possibilidade de outros clientes e organização própria da execução.",
    });
  }

  if (!extractedFacts.length) extractedFacts.push("Nenhum valor ou prazo objetivo foi extraído automaticamente.");

  const score = Math.max(
    18,
    Math.min(
      94,
      82 -
        findings.filter((item) => item.severity === "high").length * 16 -
        findings.filter((item) => item.severity === "medium").length * 7 +
        findings.filter((item) => item.severity === "positive").length * 4,
    ),
  );

  const highCount = findings.filter((item) => item.severity === "high").length;
  const summary =
    highCount > 0
      ? `O contrato parece ser ${contractType} e possui ${highCount} ponto${highCount > 1 ? "s" : ""} crítico${highCount > 1 ? "s" : ""} para negociação antes da assinatura.`
      : `O contrato parece ser ${contractType}. Não foram encontrados alertas críticos, mas há cláusulas que precisam de confirmação humana.`;

  return {
    fileName,
    contractType,
    confidence,
    score,
    summary,
    extractedFacts,
    findings,
    nextQuestions: [
      "Qual é o valor líquido anual após impostos, custos e reservas?",
      "A rotina real terá exclusividade, horário fixo ou subordinação?",
      "Existe aviso prévio, multa recíproca e limite de responsabilidade?",
      "Quais benefícios CLT precisam ser repostos no valor PJ?",
    ],
    text,
  };
}

export function answerContractQuestion(question: string, analysis: ContractAnalysis | null) {
  const normalized = normalize(question);
  const context = analysis ? ` No documento ${analysis.fileName}, classificado como ${analysis.contractType},` : "";

  if (hasAny(normalized, ["qual compensa", "vale mais", "clt ou pj", "faz mais sentido"])) {
    return `${context} a decisão não deve usar apenas o líquido mensal. CLT tende a fazer mais sentido quando previsibilidade, benefícios, 13º, férias, FGTS e proteção de desligamento têm peso alto. PJ tende a fazer mais sentido quando o valor anual líquido cobre impostos, contador, saúde, períodos sem faturamento e um prêmio de risco — e quando existe autonomia real. Use a calculadora para obter o ponto de equilíbrio financeiro.`;
  }

  if (hasAny(normalized, ["exclusividade", "outros clientes"])) {
    return `${context} exclusividade em contrato PJ merece preço maior e revisão cuidadosa. Ela reduz diversificação de receita e, se vier com horário, pessoalidade e comando direto, aumenta o risco de pejotização. Negocie liberdade para outros clientes ou um prêmio financeiro explícito.`;
  }

  if (hasAny(normalized, ["imposto", "simples", "fator r", "pro labore", "fiscal"])) {
    return `${context} a carga PJ depende do regime, atividade, faturamento acumulado, pró-labore e Fator R. A simulação deve considerar DAS, INSS e possível IRRF no pró-labore, contador e reservas. A alíquota nominal isolada não representa o custo total. Confirme o enquadramento com contador antes de assinar.`;
  }

  if (hasAny(normalized, ["risco", "problema", "alerta", "clausula"])) {
    const top = analysis?.findings.filter((item) => item.severity === "high" || item.severity === "medium").slice(0, 3);
    if (top?.length) {
      return `Os principais pontos que encontrei são: ${top.map((item) => `${item.title} — ${item.explanation}`).join(" ")} Esta é uma triagem automatizada; cláusulas críticas devem ser validadas por advogado e contador.`;
    }
  }

  if (hasAny(normalized, ["rescisao", "demissao", "aviso previo", "encerrar"])) {
    return `${context} compare antecedência, multa, pagamentos pendentes e hipóteses de término. CLT possui proteções legais específicas; no PJ, elas precisam estar escritas no contrato e refletidas no preço e na reserva de emergência.`;
  }

  return `${context} eu analisaria essa dúvida em quatro camadas: valor anual líquido, direitos e benefícios, risco contratual e autonomia real da relação. ${analysis ? analysis.summary : "Envie um contrato para eu apontar cláusulas e responder com base no texto."} A resposta é educativa e não substitui parecer jurídico, fiscal ou contábil.`;
}

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function hasAny(value: string, terms: string[]) {
  return terms.some((term) => value.includes(normalize(term)));
}

function countSignals(value: string, terms: string[]) {
  return terms.filter((term) => value.includes(normalize(term))).length;
}

function excerpt(text: string, term: string) {
  const normalizedText = normalize(text);
  const index = normalizedText.indexOf(normalize(term));
  if (index < 0) return undefined;
  const start = Math.max(0, index - 75);
  const end = Math.min(text.length, index + 180);
  return `“${text.slice(start, end).replace(/\s+/g, " ").trim()}”`;
}
