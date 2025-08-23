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

## Observações
- Não é permitido cadastrar o mesmo nome duas vezes.
- O banco de dados é em memória, os dados são perdidos ao reiniciar o servidor.

## Testes
Para testar a API com Supertest, importe o `app.js` em seu arquivo de teste sem executar o método `listen()`.

## Estrutura de Diretórios
- `controller/` - Lógica dos endpoints
- `service/` - Regras de negócio
- `model/` - Dados em memória
- `app.js` - Configuração da aplicação Express
- `server.js` - Inicialização do servidor
- `swagger.json` - Documentação Swagger

## Documentação Swagger
Acesse [http://localhost:3000/api-docs](http://localhost:3000/api-docs) após iniciar o servidor.
