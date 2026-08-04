# Fundação do time — Bora Vê Imperatriz

> ⚠️ Este é um rascunho inicial.

## 1. Integrantes e responsabilidades na Sprint 1

- Ana Clara Pontes Miranda — Coordenação e gestão da Sprint 1: organizar e priorizar os itens do quadro, acompanhar bloqueios e prazos, conduzir o registro de decisões (decisoes.md), garantir visão geral do progresso técnico e da pesquisa
- Gilvânia Elen Costa Frazão — Execução da pesquisa e evidência do problema (contato com pessoas afetadas) + estruturação técnica inicial (repositório no GitHub, configuração do quadro, levantamento da stack)
- Tcheul's Layra Varão — Levantamento inicial do conteúdo do produto: mapear e catalogar os primeiros pontos turísticos, restaurantes, bares e opções de lazer de Imperatriz que vão compor o catálogo, e apoiar a pesquisa de evidência com pessoas afetadas

## 2. Acordo de trabalho

- Canal oficial: WhatsApp (grupo da equipe)
- Disponibilidade comum: [PREENCHER, ex: noites de seg/ter/qui]
- Prazo de resposta: até 24 horas
- Horário-limite da daily assíncrona nos dias úteis sem aula: [PREENCHER, ex: até 20h]
- Registro de decisões: arquivo decisoes.md no repositório do GitHub, com entradas por data (ex: ## 04/08 — decisão de manter escopo sem roteiro personalizado). Evita depender de mensagens que se perdem no WhatsApp.
- Atualização do quadro: antes de cada aula (quarta e quinta-feira)
- Tratamento de bloqueios: avisar no grupo do WhatsApp assim que identificado + marcar o item como bloqueado no GitHub Projects

## 3. Ferramentas

- Gestão e link do quadro: GitHub Projects — [PREENCHER com o link após criar]. Escolhido porque já se integra nativamente ao repositório (issues viram cartões do quadro automaticamente) e é gratuito, evitando logar em uma ferramenta separada.
- Convite ao professor confirmado em: [PREENCHER — fernando.chagas@ifma.edu.br]
- Repositório/documentação: GitHub — [PREENCHER com o link após criar]
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

**Acesso à evidência:** [PREENCHER — pensem em: turistas ou pessoas que visitaram a cidade recentemente, donos de pousadas/hotéis, donos de restaurantes e bares locais, grupos de turismo da prefeitura de Imperatriz, secretaria de turismo do município, se existir]

**Resultado desejado:** Uma pessoa que não conhece Imperatriz consegue, em poucos minutos, encontrar opções relevantes de onde comer, se divertir ou passear, com informações confiáveis e organizadas por categoria.

**Jornada crítica inicial:** Usuário abre o site/app → busca ou filtra por categoria (ex: restaurantes) → visualiza uma lista de lugares com informações básicas (localização, tipo, horário) → escolhe um local.

**Escopo inicial:** Catálogo de pontos turísticos, restaurantes, bares e opções de lazer/compras em Imperatriz, navegável por categoria/filtro, com informações básicas de cada local.

**Não escopo (por enquanto):** Geração automática de roteiros personalizados (dias, estilo, orçamento) — ideia boa, mas fica para uma fase posterior, depois que o catálogo básico estiver validado.

**Premissas:** [PREENCHER, ex: "assumimos que existe volume suficiente de estabelecimentos interessantes para justificar o catálogo", "assumimos que conseguiremos coletar essas informações de forma confiável"]

**Restrições:** [PREENCHER, ex: tempo do semestre, equipe sem orçamento para fotos profissionais, dependência de dados que precisam ser levantados manualmente]

**Riscos:** [PREENCHER, ex: dificuldade de manter os dados atualizados, baixa adesão de estabelecimentos para fornecer informações, escopo crescer demais se a função de roteiro for antecipada]

**Justificativa de viabilidade:** O escopo inicial (catálogo simples e navegável) é pequeno o suficiente para ser levantado e implementado no semestre, especialmente por não depender de integrações complexas nem de geração automática de conteúdo — isso fica para uma etapa futura.

## 5. Stack inicial

- Stack proposta: Site web responsivo com Next.js (React) no front-end e back-end, e Supabase (Postgres + autenticação prontos) como banco de dados. Deploy gratuito via Vercel.
- Justificativa: com um time de 2 pessoas e prazo de um semestre, faz mais sentido usar uma única linguagem (JavaScript/TypeScript) tanto no front quanto no back, reduzindo a curva de aprendizado e o tempo de configuração. Um site responsivo evita a complexidade extra de publicar em lojas de aplicativo (Google Play/App Store) e já é acessível em qualquer celular pelo navegador. O Supabase evita ter que montar infraestrutura de banco de dados e autenticação do zero.
- Maior incerteza técnica: se o formato de site (em vez de app) atende bem o caso de uso de turistas usando o celular em movimento — precisa ser validado com um protótipo simples e/ou conversa com usuários.
- Primeiro experimento técnico, se necessário: protótipo simples de uma página com lista de lugares e filtro por categoria (ex: "restaurantes", "pontos turísticos"), pra testar a usabilidade em celular.

## 6. Sprint 1

- Objetivo da sprint: Levantar evidências sobre o problema (conversas com pessoas que já visitaram/moram em Imperatriz) e organizar a estrutura inicial do projeto (quadro, repositório, primeiras categorias de lugares a mapear).
- Link do quadro: [PREENCHER]
- Principal bloqueio atual: [PREENCHER, ou "sem bloqueio"]
- Decisão necessária: [PREENCHER, ex: definir se será app, site ou os dois; definir fonte inicial de dados dos estabelecimentos]

## 7. Confirmação da equipe

- Todos os integrantes revisaram e concordaram: [sim/não]
