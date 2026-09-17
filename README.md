# Bora Vê Imperatriz

Guia digital para descobrir pontos turísticos, restaurantes, bares, lazer e compras em Imperatriz-MA.

Projeto desenvolvido na disciplina de Projeto e Requisito de Software (IFMA - Imperatriz)

## Equipe
- Ana Clara Pontes Miranda
- Gilvânia Elen Costa Frazão
- José Francisco Silva Júnior
- Tcheul's Layra Varão da Silva

## Documentação
- [Fundação do time e proposta inicial do produto](./fundacao-do-time.md)
- [Registro de decisões](./decisoes.md)
- [Arquitetura](./docs/arquitetura.md)
- [Modelagem do banco](./docs/modelagem-banco.md)

## Pipeline de CI

O projeto possui uma pipeline de Integração Contínua (CI) configurada com GitHub Actions.

A pipeline é executada automaticamente em:
- Push na branch `main`.
- Pull Requests direcionados à branch `main`.

### Verificações do backend
- Instalação das dependências com `npm ci`.
- Verificação de tipos com `npm run typecheck`.
- Análise de código com `npm run lint`.
- Compilação do projeto com `npm run build`.

### Verificações do frontend
- Instalação das dependências com `npm ci`.
- Compilação do projeto com `npm run build`.

A configuração da pipeline está disponível em [.github/workflows/ci.yml](./.github/workflows/ci.yml).
