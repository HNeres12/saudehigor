# Novos Hábitos

Aplicativo de acompanhamento de saúde e hábitos: criação de hábitos com metas e frequência, log diário (jejum intermitente, treinos, nutrição) e histórico.

## Stack

- **Frontend:** Vite + React + TypeScript
- **UI:** Tailwind CSS + shadcn/ui
- **Backend:** Supabase (PostgreSQL + Auth)
- **Estado/Dados:** React Query, React Hook Form, Zod

## Rodando localmente

### Pré-requisitos

- [Node.js](https://nodejs.org/) 18 ou superior
- npm (vem junto com o Node)

### Passo a passo

```sh
# 1. Clonar o repositório
git clone https://github.com/HNeres12/saudehigor.git
cd saudehigor

# 2. Instalar dependências
npm install

# 3. Configurar variáveis de ambiente
cp .env.example .env
# Edite o .env e preencha com as credenciais do seu projeto Supabase

# 4. Rodar em modo de desenvolvimento
npm run dev
```

O app vai abrir em `http://localhost:8080`.

## Variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto com:

```
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sua-anon-key-aqui
```

Você encontra esses valores no painel do Supabase em **Project Settings → API**.

## Scripts disponíveis

- `npm run dev` — modo desenvolvimento (com hot reload)
- `npm run build` — build de produção
- `npm run preview` — pré-visualiza o build de produção localmente
- `npm run lint` — roda o linter
- `npm test` — roda os testes

## Estrutura

```
src/
  components/      Componentes da aplicação
  hooks/           Hooks customizados (useAuth, useHabits, useDailyLog...)
  integrations/    Configuração do Supabase
  pages/           Páginas (Index, NotFound)
  types/           Tipos TypeScript
  test/            Testes
supabase/
  migrations/      Migrations SQL do banco
```

## Deploy

O projeto pode ser deployado em qualquer serviço que suporte aplicações Vite/React estáticas (Vercel, Netlify, Cloudflare Pages). Lembre-se de configurar as variáveis de ambiente no painel do serviço escolhido.
