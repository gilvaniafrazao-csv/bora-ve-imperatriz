# Bora Vê

O **Bora Vê** é uma plataforma digital para descoberta de lugares, experiências e atividades locais.

O MVP está sendo desenvolvido inicialmente para **Imperatriz (MA)**, reunindo opções de gastronomia, cultura, lazer, compras e entretenimento em uma experiência de descoberta simples e regional.

Projeto desenvolvido na disciplina de **Projeto e Requisito de Software do IFMA – Campus Imperatriz**.

## Tecnologias

- **Frontend:** Next.js, React, TypeScript e Tailwind CSS
- **Backend:** Node.js, Express e TypeScript
- **Banco de dados:** PostgreSQL / Supabase
- **CI:** GitHub Actions

## Estrutura

```text
bora-ve-imperatriz/
├── backend/      # API
├── frontend/     # Aplicação web
├── supabase/     # Banco e migrations
├── docs/         # Documentação
└── .github/      # CI e templates
```

O frontend se comunica com a API Express, que é responsável pelo acesso ao Supabase/PostgreSQL.

## Executando o projeto

### Backend

```bash
cd backend
npm install
npm run dev
```

API local:

```text
http://localhost:3333
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Aplicação local:

```text
http://localhost:3000
```

Utilize os arquivos `.env.example` como referência para configurar as variáveis de ambiente.

## Documentação

- [Arquitetura](./docs/arquitetura.md)
- [Modelagem do banco](./docs/modelagem-banco.md)
- [Registro de decisões](./docs/decisoes.md)
- [Fundação do time](./docs/fundacao-do-time.md)

## Equipe

- Ana Clara Pontes Miranda
- Gilvânia Elen Costa Frazão
- José Francisco Silva Júnior
- Tcheul's Layra Varão da Silva

## Status

🚧 Projeto em desenvolvimento.