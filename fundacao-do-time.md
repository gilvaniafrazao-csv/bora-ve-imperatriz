# Fundação do time — Bora Vê Imperatriz

## 1. Integrantes e responsabilidades na Sprint 1

Ana Clara Pontes Miranda:
Coordenação e descoberta do produto: organizar e priorizar as atividades da Sprint 1, acompanhar o progresso e bloqueios, registrar decisões, conduzir a definição da proposta de valor e organizar as descobertas da equipe sobre usuários e problema.

Gilvânia Elen Costa Frazão:
Estruturação técnica e arquitetura inicial: organizar o repositório e quadro do projeto, pesquisar possibilidades de stack e infraestrutura, levantar requisitos técnicos e apoiar a definição das entidades e arquitetura a partir das histórias de usuário.

José Francisco Silva Júnior:
Pesquisa e validação do problema: conduzir entrevistas e conversas com pessoas afetadas pelo problema, registrar evidências, identificar padrões nas respostas e apoiar a validação das principais hipóteses sobre usuários e necessidades.

Tcheul's Layra Varão da Silva:
Pesquisa e definição da experiência do produto: apoiar a elaboração das histórias de usuário, mapear necessidades e comportamentos dos usuários e comerciantes, organizar os fluxos principais do produto e apoiar a definição do escopo do MVP.

## 2. Acordo de trabalho

- Canal oficial: Slack
- Disponibilidade comum: segunda, terça e sexta
- Prazo de resposta: até 24 horas
- Horário-limite da daily assíncrona nos dias úteis sem aula: segunda 21h, terça 16h e sexta 16h
- Registro de decisões: arquivo decisoes.md no repositório do GitHub, com entradas por data (ex: ## 04/08 — decisão de manter escopo sem roteiro personalizado).
- Atualização do quadro: antes de cada aula (quarta e quinta-feira)
- Tratamento de bloqueios: avisar no slack assim que identificado + marcar o item como bloqueado no GitHub Projects

## 3. Ferramentas

- Gestão e link do quadro: GitHub Projects — <https://github.com/users/gilvaniafrazao-csv/projects/1>
- Convite ao professor confirmado em: Convite enviado para fernando.chagas@ifma.edu.br em 04/08/2026, aguardando aceite
- Repositório/documentação: GitHub — <https://github.com/gilvaniafrazao-csv/bora-ve-imperatriz/tree/main>
- Canal de comunicação: Slack

## 4. Proposta inicial

**Título provisório:** Bora Vê Imperatriz

**Problema:** Moradores, visitantes e turistas têm dificuldade para descobrir restaurantes, bares, cafeterias, eventos e atividades que combinem com seus interesses. As informações estão dispersas entre Google Maps, Instagram, TikTok e indicações de amigos, tornando a busca demorada e pouco personalizada. Ao mesmo tempo, pequenos estabelecimentos enfrentam dificuldades para ganhar visibilidade e atrair novos clientes sem investir em publicidade de alto custo.

**Pessoas afetadas/usuárias:**

- Moradores de Imperatriz;
- Turistas e visitantes;
- Pessoas procurando lugares para comer, passear ou se divertir;
- Proprietários de restaurantes, bares e outros estabelecimentos locais, que podem se beneficiar de maior visibilidade;
- Organizadores de eventos.

**Indício inicial:** Observou-se que muitas pessoas utilizam diversas plataformas para decidir onde sair, como Google Maps, Instagram, TikTok e WhatsApp, indicando uma possível oportunidade para centralizar essas informações em uma experiência personalizada e regional.

**Acesso à evidência:** A equipe pretende conversar com pessoas que vivenciam o problema, incluindo moradores, visitantes recentes de Imperatriz e pessoas que costumam procurar restaurantes, bares, eventos e opções de lazer pela internet. Também serão realizadas conversas com proprietários ou responsáveis por estabelecimentos e eventos, buscando entender as dificuldades relacionadas à divulgação e atração de novos clientes. Como complemento, serão analisadas avaliações públicas e discussões em plataformas como Google Maps e redes sociais.

**Resultado desejado:** 

Facilitar a descoberta de novos estabelecimentos, eventos e opções de lazer;
Reduzir o tempo necessário para decidir onde sair;
Oferecer recomendações mais adequadas aos interesses e localização do usuário;
Entender se estabelecimentos percebem valor em utilizar uma plataforma regional para aumentar sua visibilidade;
Validar se existe interesse em mecanismos de promoção e benefícios oferecidos pela plataforma.

**Jornada crítica inicial:** 
Criar uma conta → informar preferências → permitir acesso à localização → visualizar recomendações → abrir o perfil de um estabelecimento/evento → visualizar informações → iniciar uma rota.

**Escopo inicial:** 
Cadastro e login;
Onboarding com preferências do usuário;
Página inicial personalizada;
Busca e exploração por categorias;
Filtros por preço, distância e categoria;
Mapa com estabelecimentos e eventos;
Página de detalhes do estabelecimento/evento;
Favoritos;
Perfil básico do estabelecimento;
Área básica para o proprietário gerenciar informações do estabelecimento;
Métricas básicas de visualização e interação.

**Não escopo (por enquanto):** 
Programa de fidelidade;
Reservas;
Inteligência artificial avançada para recomendações;
Sistema avançado de anúncios e campanhas patrocinadas;
Aplicativo nativo para Android e iOS.

**Premissas:** 
- Existe uma quantidade relevante de estabelecimentos, eventos e opções de lazer em Imperatriz para justificar uma experiência de descoberta regional;
- Usuários têm dificuldade para descobrir opções além dos lugares que já conhecem;
- Usuários valorizam recomendações baseadas em seus interesses e localização;
- Pequenos estabelecimentos buscam formas de aumentar sua visibilidade;
- A geolocalização pode facilitar a descoberta de opções próximas;
- Estabelecimentos podem perceber valor em ferramentas de divulgação dentro da plataforma.

**Restrições:** 
Prazo limitado ao semestre letivo;
Equipe de 4 integrantes conciliando o projeto com outras disciplinas;
Orçamento limitado para infraestrutura, APIs e serviços externos;
Dependência de APIs e serviços de terceiros, especialmente para mapas e localização;
Necessidade de validar o produto antes de investir em funcionalidades mais complexas.

**Riscos:**
A hipótese do problema pode não ser confirmada pelas entrevistas;
Os usuários podem não perceber valor suficiente em uma plataforma regional;
Dificuldade em manter informações de estabelecimentos atualizadas;
Baixa adesão dos estabelecimentos;
Dificuldade de validar o modelo de monetização;
Dependência de APIs externas e seus custos;
Crescimento excessivo do escopo durante o desenvolvimento.

**Justificativa de viabilidade:** O projeto será desenvolvido inicialmente como um MVP, priorizando as funcionalidades necessárias para validar as principais hipóteses sobre usuários, estabelecimentos e descoberta de opções de lazer em Imperatriz. A equipe pretende utilizar tecnologias e serviços já consolidados, reduzindo a complexidade de infraestrutura e permitindo concentrar os esforços na validação do problema e na construção da experiência principal do produto.

## 5. Stack inicial

- Stack proposta: A stack ainda está em definição. A equipe pretende avaliar uma arquitetura baseada em aplicação web responsiva, considerando tecnologias já conhecidas pelos integrantes, como React/Next.js, TypeScript e Supabase. A decisão final será tomada após a definição das histórias de usuário, entidades, requisitos técnicos e necessidades de infraestrutura do MVP.

- Justificativa: A escolha da stack será orientada pela necessidade de desenvolver um MVP funcional dentro do prazo do semestre, considerando o conhecimento técnico da equipe, simplicidade de desenvolvimento, custos de infraestrutura, facilidade de integração com APIs externas e possibilidade de evolução futura do produto.
  
- Maior incerteza técnica: A principal incerteza técnica está na integração com APIs de mapas e na obtenção de informações atualizadas dos estabelecimentos, considerando custos, limites de uso, disponibilidade e qualidade dos dados.
  
- Primeiro experimento técnico, se necessário: Desenvolver um protótipo capaz de obter a localização do usuário, exibir estabelecimentos próximos em um mapa e apresentar informações básicas como nome, categoria, horário de funcionamento e distância.
  
## 6. Sprint 1

- Objetivo da sprint: Levantar evidências sobre o problema (conversas com pessoas que já visitaram/moram em Imperatriz) e organizar a estrutura inicial do projeto (quadro, repositório, primeiras categorias de lugares a mapear).
- Link do quadro: <https://github.com/users/gilvaniafrazao-csv/projects/1>
- Principal bloqueio atual: Sem bloqueio no momento
- Decisão necessária: A ideia de produto ainda não está 100% definida e validada; é necessário avançar com as entrevistas e o mapeamento inicial de pontos de interesse para confirmar (ou ajustar) o problema e o escopo antes de aprofundar decisões técnicas.

## 7. Confirmação da equipe

- Todos os integrantes revisaram e concordaram: Sim
