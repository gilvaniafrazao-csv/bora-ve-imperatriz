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

**Problema:** Moradores, visitantes e turistas têm dificuldade para descobrir restaurantes, bares, cafeterias, eventos e atividades que combinem com seus interesses. As informações estão dispersas entre Google Maps, Instagram, TikTok e indicações de amigos, tornando a busca demorada e pouco personalizada. Ao mesmo tempo, pequenos estabelecimentos enfrentam dificuldades para ganhar visibilidade e atrair novos clientes sem investir em publicidade de alto custo.

**Pessoas afetadas/usuárias:**

- Moradores da cidade;
- Turistas e visitantes;
- Pessoas procurando lugares para comer ou passear;
- Donos de estabelecimentos (restaurantes, bares, pontos de lazer), que são influenciados pela visibilidade que o produto pode gerar.

**Indício inicial:** AObservou-se que a maioria das pessoas utiliza diversas plataformas para decidir onde sair (Google Maps, Instagram, TikTok e WhatsApp), indicando uma oportunidade para centralizar essas informações em uma experiência personalizada e regional.

**Acesso à evidência:** A equipe pretende conversar com pelo menos 3 pessoas nas próximas semanas: (1) turistas ou visitantes recentes de Imperatriz, buscados em redes sociais/grupos ou indicação pessoal; (2) donos ou atendentes de pousadas/hotéis locais, que lidam diretamente com visitantes perdidos na cidade; (3) donos de restaurantes, bares ou pontos de lazer, para entender se sentem falta de mais visibilidade. Além de fazer a análise das avaliações públicas do Google Maps e uma observação do comportamento dos usuários nas redes sociais.

**Resultado desejado:** Facilitar a descoberta de novos estabelecimentos, Reduzir o tempo necessário para decidir onde sair, aumentar a visibilidade dos pequenos negócios locais e validar o interesse dos estabelecimentos em utilizar promoções pagas na plataforma.

**Jornada crítica inicial:** 
Criar uma conta.
Escolher preferências.
Permitir localização.
Visualizar recomendações.
Abrir o perfil do estabelecimento.
Iniciar a rota pelo mapa.

**Escopo inicial:** 
Cadastro e login.
Onboarding de preferências.
Página inicial personalizada.
Busca por categorias.
Filtros por preço, distância e categoria.
Mapa com estabelecimentos.
Página do estabelecimento.
Favoritos.
Avaliações próprias.
Cadastro básico do comerciante.
Dashboard simples para o proprietário.

**Não escopo (por enquanto):** 
Reservas.
Programa de fidelidade.
Chat.
Inteligência artificial.
Gamificação.

**Premissas:** 
- Assumimos que existe volume suficiente de pontos turísticos, restaurantes, bares e opções de lazer em Imperatriz para justificar um catálogo dedicado.
- Assumimos que as pessoas que chegam à cidade realmente sentem falta de uma fonte centralizada de informação (e não resolvem isso facilmente por indicação de conhecidos ou Google Maps).
- Usuários valorizam recomendações personalizadas.
- Pequenos estabelecimentos buscam maior visibilidade.
- A geolocalização melhora a experiência.
- Comerciantes estariam dispostos a investir em destaque dentro da plataforma.

**Restrições:** 
- Prazo limitado ao semestre letivo, com equipe de apenas 3 integrantes conciliando a disciplina com outras matérias.
- Nenhum orçamento disponível para fotos profissionais, anúncios pagos ou aquisição de dados de terceiros.
- Dependência de APIs de mapas.

**Riscos:**
- Dificuldade em manter as informações atualizadas ao longo do tempo (horários, endereços e funcionamento de estabelecimentos mudam).
- Baixa adesão de estabelecimentos.
- Dificuldade de validar o modelo de monetização.

**Justificativa de viabilidade:** O Boravê será desenvolvido inicialmente como um MVP, priorizando apenas funcionalidades essenciais para validar a hipótese do produto. O uso de tecnologias consolidadas e APIs prontas reduz a complexidade do desenvolvimento e torna viável a entrega durante o semestre.

## 5. Stack inicial

- Stack proposta: Site web responsivo com Next.js (React) no front-end e back-end, e Supabase (Postgres + autenticação prontos) como banco de dados. Deploy gratuito via Vercel.
- Justificativa: com um time de 3 pessoas e prazo de um semestre, faz mais sentido usar uma única linguagem (JavaScript/TypeScript) tanto no front quanto no back, reduzindo a curva de aprendizado e o tempo de configuração. Um site responsivo evita a complexidade extra de publicar em lojas de aplicativo (Google Play/App Store) e já é acessível em qualquer celular pelo navegador. O Supabase evita ter que montar infraestrutura de banco de dados e autenticação do zero.
- Maior incerteza técnica: integração com APIs de mapas e na obtenção de informações atualizadas dos estabelecimentos, considerando custos, limites de uso e qualidade dos dados.
- Primeiro experimento técnico, se necessário: desenvolver um protótipo capaz de obter a localização do usuário, exibir estabelecimentos próximos em um mapa e apresentar informações básicas como nome, categoria, horário de funcionamento e distância.

## 6. Sprint 1

- Objetivo da sprint: Levantar evidências sobre o problema (conversas com pessoas que já visitaram/moram em Imperatriz) e organizar a estrutura inicial do projeto (quadro, repositório, primeiras categorias de lugares a mapear).
- Link do quadro: <https://github.com/users/gilvaniafrazao-csv/projects/1>
- Principal bloqueio atual: Sem bloqueio no momento
- Decisão necessária: A ideia de produto ainda não está 100% definida e validada; é necessário avançar com as entrevistas e o mapeamento inicial de pontos de interesse para confirmar (ou ajustar) o problema e o escopo antes de aprofundar decisões técnicas.

## 7. Confirmação da equipe

- Todos os integrantes revisaram e concordaram: Sim
