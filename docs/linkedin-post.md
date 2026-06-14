# Ideia de post para LinkedIn

## Descricao da postagem

Publiquei um projeto que nasceu de uma duvida muito comum no mercado brasileiro: afinal, quando uma proposta PJ realmente compensa em relacao a uma proposta CLT?

O projeto e uma calculadora CLT ou PJ pensada para ajudar profissionais a compararem propostas de forma mais completa, olhando alem do salario liquido mensal. A ideia e transformar uma decisao que normalmente fica no "achismo" em uma analise mais clara, com numeros, contexto e cenarios equivalentes.

Com a ferramenta, e possivel:

- comparar uma proposta CLT com uma proposta PJ lado a lado;
- informar um salario CLT e descobrir qual valor PJ seria equivalente;
- informar um valor PJ e descobrir qual salario CLT seria equivalente;
- considerar impostos, beneficios, FGTS, 13o, ferias, reservas, custos de PJ, pro-labore, Simples Nacional, Fator R e risco contratual;
- criar conta, fazer login e manter historico das simulacoes.

O valor do produto esta em apoiar decisoes reais: aceitar uma proposta, recusar uma oferta, negociar uma contraproposta ou entender se um valor aparentemente maior no PJ continua vantajoso depois de descontar custos, impostos e riscos.

Na gravacao, vou demonstrar os principais fluxos do app:

- comparacao direta entre CLT e PJ;
- calculo de PJ equivalente para quem ja tem uma referencia CLT;
- calculo de CLT equivalente para quem ja trabalha ou recebeu proposta como PJ;
- cadastro, login e historico de simulacoes.

## Tecnologias utilizadas

No backend, usei Go como linguagem principal. Foi uma escolha tambem voltada a aprendizado, e alguns pontos que ficaram fortes durante o desenvolvimento foram:

- simplicidade para estruturar uma API HTTP;
- tipagem estatica ajudando a modelar regras financeiras com mais clareza;
- performance e baixo consumo de recursos;
- compilacao rapida e binario simples de distribuir;
- padrao explicito de tratamento de erros, que obriga a pensar nos cenarios de falha;
- boa separacao entre handlers, regras de negocio, autenticacao e repositorios.

No frontend, o projeto usa React com TypeScript, Vite e Tailwind CSS.

Para banco de dados, usei Supabase com PostgreSQL. Neste projeto, o Supabase entra apenas como banco e interface amigavel de administracao. A autenticacao, o JWT e as regras do backend ficam sob responsabilidade da propria aplicacao.

## Pontos de evolucao

O produto ainda pode ficar mais inteligente. Hoje o calculo e generico, mas ja tenho claro que uma analise melhor precisa considerar mais dados pessoais e profissionais, como idade, area de atuacao, profissao, estabilidade, dependentes, tolerancia a risco, momento de carreira e objetivos financeiros.

Um dos proximos passos que planejo e incluir IA para usar esses dados de maneira mais profunda, gerar analises mais ricas e entregar uma recomendacao mais personalizada para cada contexto.

## Versao curta para legenda

Criei uma calculadora CLT ou PJ para ajudar profissionais a compararem propostas de trabalho com mais clareza.

A ferramenta compara CLT x PJ, calcula qual PJ equivale a um salario CLT, calcula qual CLT equivale a um contrato PJ e salva o historico das simulacoes para usuarios logados.

O objetivo e apoiar decisoes reais de carreira e negociacao: aceitar uma proposta, montar uma contraproposta ou entender se um valor PJ aparentemente maior realmente compensa depois de impostos, custos, reservas e riscos.

Stack: Go no backend, React + TypeScript no frontend e Supabase/PostgreSQL apenas como banco de dados. O JWT, a autenticacao e as regras da API ficam no backend da aplicacao.

Ainda e uma versao generica, mas o proximo passo e enriquecer a analise com dados pessoais e profissionais e usar IA para entregar recomendacoes mais contextualizadas.
