
# Agenda de Contatos API

API Rest e GraphQL para cadastro de contatos (nome e telefone) usando Node.js, Express e banco de dados em memória.


## Instalação

1. Instale as dependências para a API REST:

   ```pwsh
   npm install express swagger-ui-express
   ```

2. Instale as dependências para a API GraphQL:

   ```pwsh
   npm install apollo-server-express@3 express@4 graphql jsonwebtoken dotenv
   ```

## Como executar

- Para rodar a API REST:
  ```pwsh
  node server.js
  ```
- Para rodar a API GraphQL:
  ```pwsh
  node graphql/server.js
  ```
  O servidor GraphQL estará disponível em: [http://localhost:4000/graphql](http://localhost:4000/graphql)


## Endpoints REST

- `POST /contacts` - Adiciona um contato (nome e telefone)
- `GET /contacts` - Lista todos os contatos
- `GET /api-docs` - Documentação Swagger
- `POST /register` - Registra um usuário (name, password)
- `POST /login` - Autentica e retorna um token JWT (name, password)

## API GraphQL

O endpoint GraphQL estará disponível em `/graphql` após rodar `node graphql/server.js`.

### Exemplo de Query (listar contatos)

```graphql
query {
   contacts {
      name
      phone
   }
}
```

### Exemplo de Mutation (registrar usuário)

```graphql
mutation {
   register(name: "usuario", password: "senha") {
      name
      token
   }
}
```

### Exemplo de Mutation (login)

```graphql
mutation {
   login(name: "usuario", password: "senha") {
      name
      token
   }
}
```

### Exemplo de Mutation (adicionar contato)

```graphql
mutation {
   addContact(name: "matheus", phone: "3200000000") {
      name
      phone
   }
}
```

> **Atenção:** Para Mutations e Queries protegidas, envie o token JWT no header `Authorization: Bearer <token>`.


## Observações

- Não é permitido cadastrar o mesmo nome duas vezes.
- O banco de dados é em memória, os dados são perdidos ao reiniciar o servidor.
- Todos os endpoints REST e Mutations GraphQL de contatos exigem autenticação via JWT.
   - Inclua o cabeçalho `Authorization: Bearer <token>` nas requisições REST ou GraphQL.
   - Gere o token com `/login` (REST ou GraphQL) após registrar um usuário.
- Testes automatizados cobrem casos positivos e negativos de autenticação (sem token, token inválido).

## Testes

Para testar a API com Supertest, importe o `app.js` em seu arquivo de teste sem executar o método `listen()`.

### Testes de autenticação

O helper `test/helpers/getToken.js` pode ser usado para registrar/logar e obter um token JWT para uso em testes:

```js
const getToken = require("../helpers/getToken");
const token = await getToken(app, { name: "usuario", password: "senha" });
```

Os testes cobrem:

- Sucesso e falha no registro/login
- Acesso negado sem token ou com token inválido

Exemplo rápido (PowerShell):

```pwsh
# Registrar
Invoke-RestMethod -Method Post -Uri http://localhost:3000/register -Body (@{name='alice';password='s3cret'} | ConvertTo-Json) -ContentType 'application/json'

# Logar e obter token
$token = (Invoke-RestMethod -Method Post -Uri http://localhost:3000/login -Body (@{name='alice';password='s3cret'} | ConvertTo-Json) -ContentType 'application/json').token

# Usar token para listar contatos
Invoke-RestMethod -Method Get -Uri http://localhost:3000/contacts -Headers @{ Authorization = "Bearer $token" }
```


## Estrutura de Diretórios

- `controller/` - Lógica dos endpoints REST
- `service/` - Regras de negócio
- `model/` - Dados em memória
- `app.js` - Configuração da aplicação Express REST
- `server.js` - Inicialização do servidor REST
- `swagger.json` - Documentação Swagger
- `graphql/` - API GraphQL (app.js, server.js, typeDefs.js, resolvers.js)


## Documentação Swagger

Acesse [http://localhost:3000/api-docs](http://localhost:3000/api-docs) após iniciar o servidor REST.

---

## GraphQL Playground

Após rodar `node graphql/server.js`, acesse [http://localhost:4000/graphql](http://localhost:4000/graphql) para explorar e testar queries/mutations.
