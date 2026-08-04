# Fundação do time — Bora Vê Imperatriz

## 1. Integrantes e responsabilidades na Sprint 1

- Ana Clara Pontes Miranda — Coordenação e gestão da Sprint 1: organizar e priorizar os itens do quadro, acompanhar bloqueios e prazos, conduzir o registro de decisões (decisoes.md), garantir visão geral do progresso técnico e da pesquisa
- Gilvânia Elen Costa Frazão — Execução da pesquisa e evidência do problema (contato com pessoas afetadas) + estruturação técnica inicial (repositório no GitHub, configuração do quadro, levantamento da stack)
- Tcheul's Layra Varão da Silva — Levantamento inicial do conteúdo do produto: mapear e catalogar os primeiros pontos turísticos, restaurantes, bares e opções de lazer de Imperatriz que vão compor o catálogo, e apoiar a pesquisa de evidência com pessoas afetadas

## 2. Acordo de trabalho

- Canal oficial: WhatsApp (grupo da equipe)
- Disponibilidade comum: segunda, terça e sexta
- Prazo de resposta: até 24 horas
- Horário-limite da daily assíncrona nos dias úteis sem aula: segunda 21h, terça 16h e sexta 16h
- Registro de decisões: arquivo decisoes.md no repositório do GitHub, com entradas por data (ex: ## 04/08 — decisão de manter escopo sem roteiro personalizado).
- Atualização do quadro: antes de cada aula (quarta e quinta-feira)
- Tratamento de bloqueios: avisar no grupo do WhatsApp assim que identificado + marcar o item como bloqueado no GitHub Projects

## 3. Ferramentas

- Gestão e link do quadro: GitHub Projects — <https://github.com/users/gilvaniafrazao-csv/projects/1>
- Convite ao professor confirmado em: Convite enviado para fernando.chagas@ifma.edu.br em 04/08/2026, aguardando aceite
- Repositório/documentação: GitHub — <https://github.com/gilvaniafrazao-csv/bora-ve-imperatriz/tree/main>
- Canal de comunicação: WhatsApp

## 4. Proposta inicial

**Título provisório:** Bora Vê Imperatriz

**Problema:** Pessoas que chegam a Imperatriz-MA — sejam turistas, viajantes a trabalho ou até moradores novos na cidade — não têm um jeito fácil de descobrir onde ficam os pontos turísticos, restaurantes, bares, opções de lazer e compras da cidade. A informação está espalhada (Google Maps genérico, indicações de conhecidos, redes sociais soltas), o que faz com que essas pessoas percam tempo, deixem de conhecer bons lugares ou tenham experiências ruins por falta de orientação centralizada.

**Pessoas afetadas/usuárias:**

- Turistas e visitantes que chegam à cidade sem conhecer a região;
- Pessoas em viagem a trabalho, com pouco tempo livre e pouca familiaridade local;
- Possivelmente moradores locais interessados em redescobrir a cidade;
- Donos de estabelecimentos (restaurantes, bares, pontos de lazer), que são influenciados pela visibilidade que o produto pode gerar.

**Indício inicial:** A existência e popularidade de iniciativas parecidas em outras cidades (ex: Qual a Boa Manaus) mostra que existe demanda por esse tipo de curadoria local. Além disso, Imperatriz não tem, até onde a equipe identificou, uma plataforma unificada e atualizada com esse tipo de informação turística/gastronômica.

**Acesso à evidência:** A equipe pretende conversar com pelo menos 3 pessoas nas próximas semanas: (1) turistas ou visitantes recentes de Imperatriz, buscados em redes sociais/grupos ou indicação pessoal; (2) donos ou atendentes de pousadas/hotéis locais, que lidam diretamente com visitantes perdidos na cidade; (3) donos de restaurantes, bares ou pontos de lazer, para entender se sentem falta de mais visibilidade.

**Resultado desejado:** Uma pessoa que não conhece Imperatriz consegue, em poucos minutos, encontrar opções relevantes de onde comer, se divertir ou passear, com informações confiáveis e organizadas por categoria.

**Jornada crítica inicial:** Usuário abre o site → busca ou filtra por categoria (ex: restaurantes) → visualiza uma lista de lugares com informações básicas (localização, tipo, horário) → escolhe um local.

**Escopo inicial:** Catálogo de pontos turísticos, restaurantes, bares e opções de lazer/compras em Imperatriz, navegável por categoria/filtro, com informações básicas de cada local.

**Não escopo (por enquanto):** Geração automática de roteiros personalizados (dias, estilo, orçamento).

**Premissas:** 
- Assumimos que existe volume suficiente de pontos turísticos, restaurantes, bares e opções de lazer em Imperatriz para justificar um catálogo dedicado.
- Assumimos que as pessoas que chegam à cidade realmente sentem falta de uma fonte centralizada de informação (e não resolvem isso facilmente por indicação de conhecidos ou Google Maps).
- Assumimos que conseguiremos levantar as informações dos estabelecimentos de forma manual (visitando, ligando ou pesquisando online), sem depender de parceria formal com a prefeitura ou os próprios comércios nesta fase inicial.

**Restrições:** 
- Prazo limitado ao semestre letivo, com equipe de apenas 3 integrantes conciliando a disciplina com outras matérias.
- Nenhum orçamento disponível para fotos profissionais, anúncios pagos ou aquisição de dados de terceiros.
- Levantamento de dados dos estabelecimentos será manual (sem acesso a uma base de dados pronta ou API do setor de turismo local).

**Riscos:**
- Dificuldade em manter as informações atualizadas ao longo do tempo (horários, endereços e funcionamento de estabelecimentos mudam).
- Baixa disposição de donos de estabelecimentos em fornecer informações ou fotos para o catálogo.
- Risco de não encontrar pessoas suficientes para entrevistar a tempo do checkpoint, o que enfraqueceria a evidência do problema.

**Justificativa de viabilidade:** O escopo inicial (catálogo simples e navegável) é pequeno o suficiente para ser levantado e implementado no semestre, especialmente por não depender de integrações complexas nem de geração automática de conteúdo — isso fica para uma etapa futura.

## 5. Stack inicial

- Stack proposta: Site web responsivo com Next.js (React) no front-end e back-end, e Supabase (Postgres + autenticação prontos) como banco de dados. Deploy gratuito via Vercel.
- Justificativa: com um time de 2 pessoas e prazo de um semestre, faz mais sentido usar uma única linguagem (JavaScript/TypeScript) tanto no front quanto no back, reduzindo a curva de aprendizado e o tempo de configuração. Um site responsivo evita a complexidade extra de publicar em lojas de aplicativo (Google Play/App Store) e já é acessível em qualquer celular pelo navegador. O Supabase evita ter que montar infraestrutura de banco de dados e autenticação do zero.
- Maior incerteza técnica: se o formato de site (em vez de app) atende bem o caso de uso de turistas usando o celular em movimento — precisa ser validado com um protótipo simples e/ou conversa com usuários.
- Primeiro experimento técnico, se necessário: protótipo simples de uma página com lista de lugares e filtro por categoria (ex: "restaurantes", "pontos turísticos"), pra testar a usabilidade em celular.

## 6. Sprint 1

- Objetivo da sprint: Levantar evidências sobre o problema (conversas com pessoas que já visitaram/moram em Imperatriz) e organizar a estrutura inicial do projeto (quadro, repositório, primeiras categorias de lugares a mapear).
- Link do quadro: <https://github.com/users/gilvaniafrazao-csv/projects/1>
- Principal bloqueio atual: Sem bloqueio no momento
- Decisão necessária: A ideia de produto ainda não está 100% definida e validada; é necessário avançar com as entrevistas e o mapeamento inicial de pontos de interesse para confirmar (ou ajustar) o problema e o escopo antes de aprofundar decisões técnicas.

## 7. Confirmação da equipe

- Todos os integrantes revisaram e concordaram: Sim
