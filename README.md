# Agenda de Contatos API

API Rest para cadastro de contatos (nome e telefone) usando Node.js, Express e banco de dados em memória.

## Instalação

1. Instale as dependências:
   ```pwsh
   npm install express swagger-ui-express
   ```

2. Para rodar o servidor:
   ```pwsh
   node server.js
   ```

## Endpoints

- `POST /contacts` - Adiciona um contato (nome e telefone)
- `GET /contacts` - Lista todos os contatos
- `GET /api-docs` - Documentação Swagger
 - `POST /register` - Registra um usuário (name, password)
 - `POST /login` - Autentica e retorna um token JWT (name, password)

## Observações
- Não é permitido cadastrar o mesmo nome duas vezes.
- O banco de dados é em memória, os dados são perdidos ao reiniciar o servidor.
 - Todos os endpoints de contatos agora exigem autenticação via JWT.
    - Inclua o cabeçalho `Authorization: Bearer <token>` nas requisições.
    - Gere o token com `POST /login` após registrar um usuário com `POST /register`.
 - Testes automatizados cobrem casos positivos e negativos de autenticação (sem token, token inválido).
 - Utilize o helper `test/helpers/getToken.js` para obter tokens em novos testes.

## Testes
Para testar a API com Supertest, importe o `app.js` em seu arquivo de teste sem executar o método `listen()`.

### Testes de autenticação

O helper `test/helpers/getToken.js` pode ser usado para registrar/logar e obter um token JWT para uso em testes:

```js
const getToken = require('../helpers/getToken');
const token = await getToken(app, { name: 'usuario', password: 'senha' });
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
- `controller/` - Lógica dos endpoints
- `service/` - Regras de negócio
- `model/` - Dados em memória
- `app.js` - Configuração da aplicação Express
- `server.js` - Inicialização do servidor
- `swagger.json` - Documentação Swagger

## Documentação Swagger
Acesse [http://localhost:3000/api-docs](http://localhost:3000/api-docs) após iniciar o servidor.
