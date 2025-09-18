# Dependências para API GraphQL com ApolloServer, Express e JWT

- apollo-server-express@3
- express@4
- graphql
- jsonwebtoken
- bcryptjs (já usado no projeto)
- dotenv (opcional, para variáveis de ambiente)

Instale com:
npm install apollo-server-express@3 express@4 graphql jsonwebtoken dotenv

> Atenção: ApolloServer v4 não suporta Express de forma integrada, por isso a versão 3 é recomendada para integração simples.

Essas dependências permitem:
- Servir a API GraphQL via Express
- Proteger Mutations com JWT
- Reutilizar lógica dos Services existentes
