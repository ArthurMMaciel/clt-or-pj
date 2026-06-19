const pptxgen = require("pptxgenjs");

const pptx = new pptxgen();
pptx.layout = "LAYOUT_WIDE";
pptx.author = "CLT ou PJ";
pptx.company = "CLT ou PJ";
pptx.subject = "Pitch alinhado ao Programa Centelha 3 Paraná";
pptx.title = "CLT ou PJ — Inteligência para decisões de trabalho";
pptx.lang = "pt-BR";
pptx.theme = {
  headFontFace: "Aptos Display",
  bodyFontFace: "Aptos",
  lang: "pt-BR",
};
pptx.defineSlideMaster({
  title: "MASTER",
  background: { color: "F7F5EF" },
  objects: [
    { rect: { x: 0, y: 0, w: 13.333, h: 0.08, fill: { color: "D6F36A" }, line: { color: "D6F36A" } } },
    { text: { text: "CLT ou PJ", options: { x: 0.45, y: 7.08, w: 1.5, h: 0.18, fontFace: "Aptos", fontSize: 8, color: "67716E", margin: 0 } } },
    { text: { text: "Programa Centelha 3 • Paraná", options: { x: 10.5, y: 7.08, w: 2.35, h: 0.18, fontFace: "Aptos", fontSize: 8, color: "67716E", align: "right", margin: 0 } } },
  ],
});

const C = {
  ink: "17211F",
  mint: "2F8F72",
  lime: "D6F36A",
  paper: "F7F5EF",
  white: "FFFFFF",
  clay: "C46A4A",
  gray: "67716E",
  light: "E8ECE8",
  amber: "D89B2B",
  blue: "3977A8",
};

const noLine = { color: "F7F5EF", transparency: 100 };
const softShadow = { type: "outer", color: "17211F", blur: 2, angle: 45, distance: 1, opacity: 0.12 };

function addSlide(title, kicker) {
  const slide = pptx.addSlide("MASTER");
  if (kicker) {
    slide.addText(kicker.toUpperCase(), {
      x: 0.55, y: 0.42, w: 5.8, h: 0.22, fontSize: 10, bold: true, color: C.mint,
      charSpacing: 1.6, margin: 0,
    });
  }
  slide.addText(title, {
    x: 0.55, y: 0.72, w: 12.15, h: 0.62, fontSize: 28, bold: true, color: C.ink,
    margin: 0, breakLine: false, fit: "shrink",
  });
  return slide;
}

function card(slide, x, y, w, h, options = {}) {
  slide.addShape(pptx.ShapeType.roundRect, {
    x, y, w, h,
    rectRadius: 0.08,
    fill: { color: options.fill ?? C.white },
    line: { color: options.line ?? "DFE5E1", width: options.lineWidth ?? 1 },
    shadow: options.shadow === false ? undefined : softShadow,
  });
}

function pill(slide, text, x, y, w, fill = C.lime, color = C.ink) {
  slide.addShape(pptx.ShapeType.roundRect, {
    x, y, w, h: 0.34, rectRadius: 0.12,
    fill: { color: fill }, line: { color: fill },
  });
  slide.addText(text, {
    x: x + 0.08, y: y + 0.075, w: w - 0.16, h: 0.16, fontSize: 9, bold: true,
    color, align: "center", margin: 0, fit: "shrink",
  });
}

function metric(slide, value, label, x, y, w, accent = C.mint) {
  card(slide, x, y, w, 1.12, { shadow: false });
  slide.addShape(pptx.ShapeType.rect, { x, y, w: 0.08, h: 1.12, fill: { color: accent }, line: { color: accent } });
  slide.addText(value, { x: x + 0.25, y: y + 0.2, w: w - 0.4, h: 0.38, fontSize: 23, bold: true, color: C.ink, margin: 0, fit: "shrink" });
  slide.addText(label, { x: x + 0.25, y: y + 0.69, w: w - 0.4, h: 0.2, fontSize: 10, color: C.gray, margin: 0, fit: "shrink" });
}

function bulletList(slide, items, x, y, w, fontSize = 15, color = C.ink, gap = 0.58) {
  items.forEach((item, index) => {
    slide.addShape(pptx.ShapeType.ellipse, {
      x, y: y + index * gap + 0.08, w: 0.13, h: 0.13,
      fill: { color: C.mint }, line: { color: C.mint },
    });
    slide.addText(item, {
      x: x + 0.28, y: y + index * gap, w: w - 0.28, h: 0.38,
      fontSize, color, margin: 0, breakLine: false, fit: "shrink",
    });
  });
}

function addNotes(slide, lines) {
  if (typeof slide.addNotes === "function") slide.addNotes(lines);
}

// 1 — Capa
{
  const slide = pptx.addSlide();
  slide.background = { color: C.ink };
  slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 0.13, h: 7.5, fill: { color: C.lime }, line: { color: C.lime } });
  slide.addText("CLT ou PJ", { x: 0.75, y: 0.68, w: 3.4, h: 0.35, fontSize: 16, bold: true, color: C.lime, margin: 0 });
  slide.addText("A decisão de carreira\nque cabe no bolso —\ne no contrato.", {
    x: 0.75, y: 1.42, w: 7.15, h: 2.15, fontSize: 36, bold: true, color: C.white,
    margin: 0, breakLine: false, fit: "shrink",
  });
  slide.addText("Plataforma brasileira que combina cálculo financeiro, explicação conversacional e triagem inteligente de contratos CLT e PJ.", {
    x: 0.78, y: 4.0, w: 6.8, h: 0.85, fontSize: 17, color: "C8D0CD", margin: 0, breakLine: false, fit: "shrink",
  });
  pill(slide, "PITCH • CENTELHA 3 PARANÁ", 0.78, 5.2, 2.35, C.lime, C.ink);

  slide.addShape(pptx.ShapeType.roundRect, {
    x: 8.4, y: 0.92, w: 4.1, h: 5.5, rectRadius: 0.12,
    fill: { color: "22312E" }, line: { color: "3C4B48" }, shadow: { ...softShadow, color: "000000", opacity: 0.32 },
  });
  slide.addText("Especialista CLT ou PJ", { x: 8.75, y: 1.25, w: 2.85, h: 0.3, fontSize: 16, bold: true, color: C.white, margin: 0 });
  slide.addText("IA demonstrativa • regras 2026", { x: 8.75, y: 1.62, w: 2.7, h: 0.2, fontSize: 9, color: "93A39E", margin: 0 });
  card(slide, 8.75, 2.16, 3.3, 1.05, { fill: C.white, line: C.white, shadow: false });
  slide.addText("“Esta proposta PJ realmente compensa meu pacote CLT?”", { x: 9.0, y: 2.43, w: 2.75, h: 0.48, fontSize: 12, color: C.ink, italic: true, margin: 0, fit: "shrink" });
  card(slide, 8.75, 3.48, 3.3, 1.55, { fill: C.mint, line: C.mint, shadow: false });
  slide.addText("Analisei valor anual, benefícios, impostos, reservas e risco contratual.", { x: 9.0, y: 3.77, w: 2.78, h: 0.52, fontSize: 12, color: C.white, margin: 0, fit: "shrink" });
  slide.addText("PJ recomendado: R$ 15,5 mil/mês", { x: 9.0, y: 4.52, w: 2.78, h: 0.24, fontSize: 12, bold: true, color: C.lime, margin: 0, fit: "shrink" });
  pill(slide, "Contrato: 3 alertas críticos", 8.75, 5.38, 2.25, C.clay, C.white);
  addNotes(slide, ["Abrir com uma pergunta: quanto custa decidir errado entre CLT e PJ? A resposta não é só tributária; envolve proteção, risco e cláusulas."]);
}

// 2 — Problema
{
  const slide = addSlide("Hoje, a decisão é tomada com uma conta incompleta", "Problema e oportunidade");
  slide.addText("O trabalhador recebe dois números mensais. O custo real está espalhado em impostos, benefícios, risco e contrato.", {
    x: 0.58, y: 1.5, w: 8.1, h: 0.62, fontSize: 17, color: C.gray, margin: 0, fit: "shrink",
  });
  const problems = [
    ["Comparação rasa", "Salário líquido versus nota fiscal, sem pacote anual."],
    ["Informação fragmentada", "Planilhas, vídeos, contador e advogado em momentos diferentes."],
    ["Risco invisível", "Exclusividade, rescisão, responsabilidade e pejotização ficam fora da conta."],
  ];
  problems.forEach(([title, body], i) => {
    const x = 0.58 + i * 4.16;
    card(slide, x, 2.45, 3.72, 2.65);
    slide.addText(`0${i + 1}`, { x: x + 0.28, y: 2.72, w: 0.55, h: 0.35, fontSize: 18, bold: true, color: C.mint, margin: 0 });
    slide.addText(title, { x: x + 0.28, y: 3.25, w: 3.08, h: 0.34, fontSize: 18, bold: true, color: C.ink, margin: 0 });
    slide.addText(body, { x: x + 0.28, y: 3.82, w: 3.08, h: 0.72, fontSize: 13, color: C.gray, margin: 0, fit: "shrink" });
  });
  slide.addShape(pptx.ShapeType.roundRect, { x: 0.58, y: 5.55, w: 12.05, h: 0.78, rectRadius: 0.08, fill: { color: C.ink }, line: noLine });
  slide.addText("Consequência: pessoas aceitam menos valor, assumem risco excessivo ou recusam boas propostas por falta de clareza.", {
    x: 0.9, y: 5.81, w: 11.4, h: 0.27, fontSize: 15, bold: true, color: C.white, align: "center", margin: 0, fit: "shrink",
  });
  addNotes(slide, ["Conectar o problema a uma decisão concreta: uma diferença pequena na proposta pode virar dezenas de milhares de reais por ano."]);
}

// 3 — Solução
{
  const slide = addSlide("Uma jornada única: calcular, conversar e analisar", "Solução inovadora");
  const steps = [
    ["1", "Calcular", "Compara pacote anual CLT e PJ, direitos, impostos, custos e reserva."],
    ["2", "Explicar", "Agente conversacional traduz o resultado e responde dúvidas específicas."],
    ["3", "Analisar", "PDF/DOCX é triado por cláusulas, riscos e pontos de negociação."],
    ["4", "Decidir", "Usuário recebe recomendação justificável e próximos passos."],
  ];
  steps.forEach(([number, title, body], i) => {
    const x = 0.55 + i * 3.14;
    card(slide, x, 1.72, 2.75, 3.5, { fill: i === 3 ? C.ink : C.white, line: i === 3 ? C.ink : "DFE5E1" });
    slide.addShape(pptx.ShapeType.ellipse, { x: x + 0.28, y: 2.04, w: 0.52, h: 0.52, fill: { color: i === 3 ? C.lime : C.mint }, line: noLine });
    slide.addText(number, { x: x + 0.28, y: 2.17, w: 0.52, h: 0.18, fontSize: 11, bold: true, color: i === 3 ? C.ink : C.white, align: "center", margin: 0 });
    slide.addText(title, { x: x + 0.28, y: 2.85, w: 2.1, h: 0.38, fontSize: 19, bold: true, color: i === 3 ? C.white : C.ink, margin: 0 });
    slide.addText(body, { x: x + 0.28, y: 3.48, w: 2.15, h: 1.05, fontSize: 13, color: i === 3 ? "C8D0CD" : C.gray, margin: 0, fit: "shrink" });
    if (i < 3) {
      slide.addShape(pptx.ShapeType.chevron, { x: x + 2.81, y: 3.1, w: 0.24, h: 0.45, fill: { color: C.lime }, line: noLine });
    }
  });
  slide.addText("A inovação está na combinação: motor financeiro auditável + linguagem acessível + inteligência documental contextual.", {
    x: 1.05, y: 5.7, w: 11.15, h: 0.5, fontSize: 17, bold: true, color: C.mint, align: "center", margin: 0, fit: "shrink",
  });
}

// 4 — Produto
{
  const slide = addSlide("MVP funcional e demonstrável", "Evidência do estágio atual");
  slide.addText("O protótipo já conecta cálculo real, conta demo, histórico, conversas e upload de contratos.", {
    x: 0.58, y: 1.42, w: 8.8, h: 0.4, fontSize: 15, color: C.gray, margin: 0,
  });
  card(slide, 0.58, 2.02, 7.7, 4.32, { fill: C.white });
  slide.addShape(pptx.ShapeType.rect, { x: 0.58, y: 2.02, w: 1.55, h: 4.32, fill: { color: C.ink }, line: { color: C.ink } });
  pill(slide, "+ Nova conversa", 0.79, 2.34, 1.13, C.lime, C.ink);
  slide.addText("SUAS CONVERSAS", { x: 0.78, y: 3.05, w: 1.1, h: 0.15, fontSize: 7, bold: true, color: "7C8985", charSpacing: 1, margin: 0 });
  ["Proposta PJ 15 mil", "Comparação benefícios", "Contrato Tech"].forEach((item, i) => {
    slide.addText(item, { x: 0.78, y: 3.42 + i * 0.53, w: 1.07, h: 0.18, fontSize: 8.5, color: i === 0 ? C.white : "899691", margin: 0, fit: "shrink" });
  });
  slide.addText("Especialista CLT ou PJ", { x: 2.48, y: 2.35, w: 2.55, h: 0.25, fontSize: 14, bold: true, color: C.ink, margin: 0 });
  slide.addText("Simulação de IA • regras 2026", { x: 2.48, y: 2.7, w: 2.3, h: 0.16, fontSize: 8.5, color: C.gray, margin: 0 });
  card(slide, 2.48, 3.15, 4.85, 0.82, { fill: "F7F5EF", line: "E3E7E4", shadow: false });
  slide.addText("Envie seu contrato e pergunte: esta proposta realmente compensa?", { x: 2.72, y: 3.42, w: 4.3, h: 0.22, fontSize: 11, color: C.ink, margin: 0, fit: "shrink" });
  card(slide, 3.15, 4.28, 4.18, 1.18, { fill: C.mint, line: C.mint, shadow: false });
  slide.addText("Contrato PJ: 3 alertas críticos. Exclusividade + horário fixo elevam o risco e exigem prêmio maior.", {
    x: 3.42, y: 4.58, w: 3.62, h: 0.5, fontSize: 11, color: C.white, margin: 0, fit: "shrink",
  });
  slide.addShape(pptx.ShapeType.roundRect, { x: 2.48, y: 5.78, w: 4.85, h: 0.34, rectRadius: 0.08, fill: { color: "F3F5F3" }, line: { color: "DFE5E1" } });
  slide.addText("Pergunte sobre CLT, PJ ou uma cláusula...", { x: 2.68, y: 5.87, w: 3.7, h: 0.13, fontSize: 8, color: "8B9693", margin: 0 });

  metric(slide, "3", "formatos de contrato: PDF, DOCX, TXT", 8.72, 2.02, 3.9, C.mint);
  metric(slide, "100%", "processamento local na demonstração", 8.72, 3.38, 3.9, C.blue);
  metric(slide, "2026", "parâmetros fiscais versionados no motor", 8.72, 4.74, 3.9, C.clay);
  addNotes(slide, ["Demonstrar o login fake, as abas que surgem, o contrato de exemplo e uma pergunta rápida."]);
}

// 5 — Diferencial
{
  const slide = addSlide("Explicável por design — não uma resposta opaca", "Diferencial tecnológico");
  const rows = [
    ["Motor financeiro", "Cálculos determinísticos e testáveis", "Evita recomendação sem memória de cálculo"],
    ["Camada conversacional", "Respostas guiadas pelas regras CLT/PJ", "Traduz complexidade em decisão"],
    ["Inteligência documental", "Extração + sinais de risco + evidências", "Conecta a resposta ao contrato real"],
    ["Governança", "Avisos, versionamento e revisão especializada", "Reduz risco regulatório e de confiança"],
  ];
  slide.addText("CAMADA", { x: 0.7, y: 1.63, w: 2.2, h: 0.2, fontSize: 9, bold: true, color: C.gray, charSpacing: 1.3, margin: 0 });
  slide.addText("COMO FUNCIONA", { x: 3.45, y: 1.63, w: 3.4, h: 0.2, fontSize: 9, bold: true, color: C.gray, charSpacing: 1.3, margin: 0 });
  slide.addText("VALOR GERADO", { x: 8.15, y: 1.63, w: 3.4, h: 0.2, fontSize: 9, bold: true, color: C.gray, charSpacing: 1.3, margin: 0 });
  rows.forEach((row, i) => {
    const y = 2.0 + i * 1.05;
    card(slide, 0.58, y, 12.05, 0.82, { shadow: false, fill: i % 2 ? "F1F3EF" : C.white });
    slide.addText(row[0], { x: 0.85, y: y + 0.25, w: 2.25, h: 0.22, fontSize: 13, bold: true, color: C.ink, margin: 0, fit: "shrink" });
    slide.addText(row[1], { x: 3.45, y: y + 0.24, w: 3.9, h: 0.24, fontSize: 12.5, color: C.gray, margin: 0, fit: "shrink" });
    slide.addText(row[2], { x: 8.15, y: y + 0.24, w: 3.95, h: 0.24, fontSize: 12.5, color: C.mint, bold: true, margin: 0, fit: "shrink" });
  });
  slide.addText("Próxima evolução tecnológica", { x: 0.6, y: 6.35, w: 2.4, h: 0.24, fontSize: 12, bold: true, color: C.ink, margin: 0 });
  pill(slide, "RAG jurídico-fiscal", 3.15, 6.28, 1.55, C.ink, C.white);
  pill(slide, "Fontes oficiais versionadas", 4.9, 6.28, 2.05, C.ink, C.white);
  pill(slide, "Auditoria de respostas", 7.15, 6.28, 1.85, C.ink, C.white);
  pill(slide, "LGPD by design", 9.2, 6.28, 1.45, C.ink, C.white);
}

// 6 — Mercado e modelo
{
  const slide = addSlide("Começamos pelo usuário; escalamos via empresas e parceiros", "Mercado e modelo de negócio");
  const segments = [
    ["B2C", "Profissionais em transição", "Freemium + assinatura\nR$ 29–59/mês"],
    ["B2B2C", "Recrutamento e benefícios", "Licença por colaborador\nou análise"],
    ["Parcerias", "Contabilidades e jurídico", "Indicação, white-label\ne receita compartilhada"],
  ];
  segments.forEach(([tag, title, model], i) => {
    const x = 0.58 + i * 4.17;
    card(slide, x, 1.72, 3.72, 2.45);
    pill(slide, tag, x + 0.28, 2.0, 0.75, i === 0 ? C.lime : i === 1 ? C.mint : C.blue, i === 0 ? C.ink : C.white);
    slide.addText(title, { x: x + 0.28, y: 2.63, w: 3.05, h: 0.36, fontSize: 18, bold: true, color: C.ink, margin: 0, fit: "shrink" });
    slide.addText(model, { x: x + 0.28, y: 3.28, w: 3.05, h: 0.5, fontSize: 13, color: C.gray, margin: 0, fit: "shrink" });
  });
  slide.addText("Hipótese de escala em 36 meses", { x: 0.58, y: 4.65, w: 3.7, h: 0.3, fontSize: 16, bold: true, color: C.ink, margin: 0 });
  metric(slide, "10 mil", "assinantes pagantes", 0.58, 5.18, 3.6, C.mint);
  metric(slide, "R$ 39", "ticket médio mensal B2C", 4.43, 5.18, 3.6, C.blue);
  metric(slide, "R$ 4,7 mi", "receita recorrente anual potencial", 8.28, 5.18, 4.35, C.clay);
  slide.addText("Estimativas bottom-up para validação; não representam tração atual.", {
    x: 8.35, y: 6.49, w: 4.25, h: 0.18, fontSize: 8.5, italic: true, color: C.gray, align: "right", margin: 0,
  });
}

// 7 — Impacto
{
  const slide = addSlide("Mais autonomia econômica e relações de trabalho mais transparentes", "Impacto socioambiental");
  const impacts = [
    ["Decisão financeira", "Reduz assimetria de informação em momentos de alto impacto na renda."],
    ["Prevenção", "Ajuda a identificar cláusulas desequilibradas antes da assinatura."],
    ["Inclusão", "Transforma linguagem fiscal e jurídica em explicações acessíveis."],
    ["Formalização", "Orienta reservas, impostos e gestão responsável para quem atua como PJ."],
  ];
  impacts.forEach(([title, body], i) => {
    const x = i % 2 === 0 ? 0.58 : 6.68;
    const y = i < 2 ? 1.72 : 4.08;
    card(slide, x, y, 5.95, 1.82);
    slide.addShape(pptx.ShapeType.ellipse, { x: x + 0.3, y: y + 0.38, w: 0.52, h: 0.52, fill: { color: i === 0 ? C.lime : C.mint }, line: noLine });
    slide.addText(`${i + 1}`, { x: x + 0.3, y: y + 0.51, w: 0.52, h: 0.18, fontSize: 11, bold: true, color: i === 0 ? C.ink : C.white, align: "center", margin: 0 });
    slide.addText(title, { x: x + 1.05, y: y + 0.32, w: 4.35, h: 0.3, fontSize: 17, bold: true, color: C.ink, margin: 0 });
    slide.addText(body, { x: x + 1.05, y: y + 0.84, w: 4.35, h: 0.58, fontSize: 12.5, color: C.gray, margin: 0, fit: "shrink" });
  });
  slide.addText("Indicadores que serão medidos", { x: 0.58, y: 6.32, w: 2.3, h: 0.22, fontSize: 11, bold: true, color: C.ink, margin: 0 });
  pill(slide, "decisões apoiadas", 3.0, 6.24, 1.55, C.ink, C.white);
  pill(slide, "renda protegida", 4.72, 6.24, 1.45, C.ink, C.white);
  pill(slide, "cláusulas renegociadas", 6.35, 6.24, 1.9, C.ink, C.white);
  pill(slide, "NPS e confiança", 8.45, 6.24, 1.45, C.ink, C.white);
  pill(slide, "parcerias locais", 10.08, 6.24, 1.55, C.ink, C.white);
}

// 8 — Roadmap e uso dos recursos
{
  const slide = addSlide("12 meses para sair do protótipo e provar o negócio", "Cronograma físico e orçamento");
  const phases = [
    ["M1–M3", "Validar", "50 entrevistas\n20 testes assistidos"],
    ["M4–M6", "Construir", "IA com fontes\nsegurança e LGPD"],
    ["M7–M9", "Pilotar", "3 parceiros\n500 usuários"],
    ["M10–M12", "Escalar", "pagamento\nmétricas e vendas"],
  ];
  phases.forEach(([time, title, body], i) => {
    const x = 0.58 + i * 3.12;
    slide.addShape(pptx.ShapeType.line, { x: x + 0.35, y: 2.05, w: 2.75, h: 0, line: { color: i === 3 ? C.paper : "BFC8C4", width: 2 } });
    slide.addShape(pptx.ShapeType.ellipse, { x, y: 1.77, w: 0.58, h: 0.58, fill: { color: i === 0 ? C.lime : C.mint }, line: noLine });
    slide.addText(`${i + 1}`, { x, y: 1.92, w: 0.58, h: 0.17, fontSize: 11, bold: true, color: i === 0 ? C.ink : C.white, align: "center", margin: 0 });
    slide.addText(time, { x, y: 2.6, w: 1.0, h: 0.2, fontSize: 10, bold: true, color: C.mint, margin: 0 });
    slide.addText(title, { x, y: 2.94, w: 2.25, h: 0.35, fontSize: 18, bold: true, color: C.ink, margin: 0 });
    slide.addText(body, { x, y: 3.48, w: 2.35, h: 0.56, fontSize: 12, color: C.gray, margin: 0, fit: "shrink" });
  });
  slide.addText("Aplicação proposta da subvenção de até R$ 96 mil", { x: 0.58, y: 4.62, w: 4.4, h: 0.3, fontSize: 15, bold: true, color: C.ink, margin: 0 });
  const budget = [
    ["Desenvolvimento e IA", 42, C.mint],
    ["Especialistas jurídico/fiscal", 20, C.blue],
    ["Segurança, LGPD e infraestrutura", 18, C.clay],
    ["Pesquisa, pilotos e go-to-market", 20, C.amber],
  ];
  let start = 0.58;
  budget.forEach(([label, percent, color]) => {
    const width = 12.05 * (percent / 100);
    slide.addShape(pptx.ShapeType.rect, { x: start, y: 5.22, w: width, h: 0.5, fill: { color }, line: { color } });
    start += width;
  });
  budget.forEach(([label, percent, color], i) => {
    const x = 0.58 + (i % 2) * 6.05;
    const y = 6.0 + Math.floor(i / 2) * 0.4;
    slide.addShape(pptx.ShapeType.ellipse, { x, y: y + 0.03, w: 0.13, h: 0.13, fill: { color }, line: { color } });
    slide.addText(`${percent}% ${label}`, { x: x + 0.23, y, w: 5.5, h: 0.18, fontSize: 9.5, color: C.gray, margin: 0, fit: "shrink" });
  });
}

// 9 — Equipe e gaps
{
  const slide = addSlide("Tecnologia construída; especialização será incorporada ao projeto", "Equipe executora");
  card(slide, 0.58, 1.68, 4.15, 4.7, { fill: C.ink, line: C.ink });
  slide.addShape(pptx.ShapeType.ellipse, { x: 1.0, y: 2.12, w: 0.92, h: 0.92, fill: { color: C.lime }, line: noLine });
  slide.addText("AM", { x: 1.0, y: 2.38, w: 0.92, h: 0.26, fontSize: 18, bold: true, color: C.ink, align: "center", margin: 0 });
  slide.addText("Arthur Maciel", { x: 1.0, y: 3.35, w: 2.8, h: 0.36, fontSize: 21, bold: true, color: C.white, margin: 0 });
  slide.addText("Proponente • Produto e Tecnologia", { x: 1.0, y: 3.86, w: 2.8, h: 0.24, fontSize: 12, color: C.lime, margin: 0, fit: "shrink" });
  slide.addText("Responsável pelo MVP full-stack, motor de cálculo, experiência do usuário e execução técnica.", {
    x: 1.0, y: 4.45, w: 3.2, h: 0.82, fontSize: 13, color: "C8D0CD", margin: 0, fit: "shrink",
  });
  slide.addText("Dados da equipe devem ser ajustados antes da submissão.", { x: 1.0, y: 5.78, w: 3.15, h: 0.22, fontSize: 8.5, italic: true, color: "879590", margin: 0 });

  slide.addText("Competências a incorporar", { x: 5.25, y: 1.75, w: 3.1, h: 0.3, fontSize: 18, bold: true, color: C.ink, margin: 0 });
  const gaps = [
    ["Jurídico trabalhista", "Curadoria de cláusulas, limites e protocolos de encaminhamento."],
    ["Contabilidade e tributos", "Validação periódica dos parâmetros, regimes e cenários."],
    ["Mercado e parcerias", "Pilotos com RH, contabilidades e comunidades profissionais."],
  ];
  gaps.forEach(([title, body], i) => {
    const y = 2.35 + i * 1.25;
    card(slide, 5.25, y, 7.38, 0.95, { shadow: false });
    slide.addShape(pptx.ShapeType.ellipse, { x: 5.52, y: y + 0.28, w: 0.38, h: 0.38, fill: { color: C.mint }, line: noLine });
    slide.addText("+", { x: 5.52, y: y + 0.36, w: 0.38, h: 0.18, fontSize: 12, bold: true, color: C.white, align: "center", margin: 0 });
    slide.addText(title, { x: 6.12, y: y + 0.18, w: 2.25, h: 0.24, fontSize: 14, bold: true, color: C.ink, margin: 0, fit: "shrink" });
    slide.addText(body, { x: 8.35, y: y + 0.16, w: 3.95, h: 0.5, fontSize: 11, color: C.gray, margin: 0, fit: "shrink" });
  });
  pill(slide, "Até 5 integrantes na equipe executora", 6.65, 6.25, 2.7, C.lime, C.ink);
}

// 10 — Pedido
{
  const slide = pptx.addSlide();
  slide.background = { color: C.ink };
  slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 13.333, h: 0.1, fill: { color: C.lime }, line: { color: C.lime } });
  slide.addText("O que queremos validar com o Centelha", { x: 0.78, y: 0.72, w: 7.4, h: 0.55, fontSize: 29, bold: true, color: C.white, margin: 0 });
  bulletList(slide, [
    "Pessoas pagam por uma recomendação explicável antes de aceitar uma proposta.",
    "Análise de contrato aumenta confiança, recorrência e valor percebido.",
    "RHs, contabilidades e comunidades são canais eficientes de aquisição.",
    "Governança e especialistas tornam a solução segura e escalável.",
  ], 0.85, 1.75, 7.25, 16, C.white, 0.83);
  card(slide, 8.65, 1.05, 3.82, 4.95, { fill: "22312E", line: "3A4946", shadow: false });
  slide.addText("Recursos solicitados", { x: 9.0, y: 1.45, w: 2.8, h: 0.25, fontSize: 12, bold: true, color: "A7B2AE", margin: 0 });
  slide.addText("até R$ 96 mil", { x: 9.0, y: 1.9, w: 2.9, h: 0.54, fontSize: 30, bold: true, color: C.lime, margin: 0, fit: "shrink" });
  slide.addText("+ até R$ 50 mil em bolsas", { x: 9.0, y: 2.6, w: 2.95, h: 0.3, fontSize: 14, color: C.white, margin: 0, fit: "shrink" });
  slide.addShape(pptx.ShapeType.line, { x: 9.0, y: 3.25, w: 3.05, h: 0, line: { color: "465652", width: 1 } });
  slide.addText("Objetivo em 12 meses", { x: 9.0, y: 3.62, w: 2.4, h: 0.24, fontSize: 12, bold: true, color: "A7B2AE", margin: 0 });
  slide.addText("Produto validado,\n500 usuários e\n3 pilotos parceiros.", { x: 9.0, y: 4.1, w: 2.75, h: 1.15, fontSize: 22, bold: true, color: C.white, margin: 0, fit: "shrink" });
  slide.addText("CLT ou PJ", { x: 0.78, y: 6.38, w: 2.0, h: 0.3, fontSize: 17, bold: true, color: C.lime, margin: 0 });
  slide.addText("Transformando uma decisão confusa em uma escolha consciente.", { x: 2.7, y: 6.39, w: 6.3, h: 0.25, fontSize: 13, color: "A7B2AE", margin: 0, fit: "shrink" });
  addNotes(slide, ["Fechar pedindo validação: não queremos automatizar aconselhamento profissional, mas tornar a primeira decisão muito mais clara e encaminhar os casos certos."]);
}

// 11 — Apêndice do edital
{
  const slide = addSlide("Como o pitch responde aos critérios do edital", "Apêndice • Programa Centelha 3 Paraná");
  const criteria = [
    ["Solução (peso 2 na Fase 1)", "Combinação inovadora de cálculo, conversa e análise documental."],
    ["Mercado", "Dor recorrente, modelo B2C e expansão B2B2C com canais parceiros."],
    ["Impacto socioambiental", "Autonomia econômica, prevenção e acesso à informação."],
    ["Equipe executora", "MVP técnico existente e plano explícito para incorporar especialistas."],
    ["Consistência da proposta (peso 2 na Fase 2)", "Cronograma de 12 meses, orçamento e metas de validação."],
  ];
  criteria.forEach(([title, body], i) => {
    const y = 1.55 + i * 0.98;
    slide.addShape(pptx.ShapeType.roundRect, { x: 0.58, y, w: 3.75, h: 0.68, rectRadius: 0.06, fill: { color: i === 0 || i === 4 ? C.ink : C.mint }, line: noLine });
    slide.addText(title, { x: 0.82, y: y + 0.22, w: 3.25, h: 0.2, fontSize: 11.5, bold: true, color: C.white, margin: 0, fit: "shrink" });
    slide.addText(body, { x: 4.72, y: y + 0.17, w: 7.35, h: 0.34, fontSize: 13, color: C.gray, margin: 0, fit: "shrink" });
  });
  slide.addText("Marcos do edital consultado", { x: 0.58, y: 6.38, w: 2.5, h: 0.22, fontSize: 11, bold: true, color: C.ink, margin: 0 });
  slide.addText("Fase 1 até 22/06/2026 • até 48 projetos • até R$ 96 mil de subvenção + até R$ 50 mil em bolsas • execução de 12 meses", {
    x: 3.0, y: 6.35, w: 9.55, h: 0.28, fontSize: 10.5, color: C.mint, bold: true, margin: 0, fit: "shrink",
  });
  slide.addText("Fonte: Edital 14/2026 — Programa Centelha 3 Paraná, Fundação Araucária, publicado em 22/05/2026.", {
    x: 0.58, y: 6.78, w: 9.0, h: 0.18, fontSize: 8.5, color: C.gray, margin: 0,
  });
}

pptx
  .writeFile({ fileName: "docs/CLT-ou-PJ-Pitch-Centelha-3-PR.pptx" })
  .then(() => console.log("Pitch gerado em docs/CLT-ou-PJ-Pitch-Centelha-3-PR.pptx"))
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
