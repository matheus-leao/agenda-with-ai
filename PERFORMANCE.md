# Testes de Performance utilizando o K6

Os testes estão salvos na pasta `tests/k6`. Nela contêm os arquivos de teste e os helpers utilizados nos testes. Abaixo estão detalhados todos os conceitos empregados e seus respectivos trechos de código.

## Sumário

- [Testes de Performance utilizando o K6](#testes-de-performance-utilizando-o-k6)
  - [Sumário](#sumário)
  - [Thresholds](#thresholds)
    - [user.test.js](#usertestjs)
    - [contact.test.js](#contacttestjs)
  - [Checks](#checks)
    - [contact.test.js](#contacttestjs-1)
  - [Helpers](#helpers)
    - [urlHelper.js](#urlhelperjs)
    - [userHelper.js](#userhelperjs)
  - [Trends](#trends)
  - [Faker](#faker)
  - [Variável de Ambiente](#variável-de-ambiente)
  - [Stages](#stages)
  - [Uso de Token de Autenticação e Reaproveitamento de Resposta](#uso-de-token-de-autenticação-e-reaproveitamento-de-resposta)
    - [contact.test.js](#contacttestjs-2)
  - [Data-Driven Testing](#data-driven-testing)
  - [Groups](#groups)

## Thresholds

No projeto foram utilizados alguns thresholds:

| Threshold | Significado |
| -------- | ------- |
| `http_req_failed: ["rate<0.01"]` | Taxa de erros em requisições HTTP deve ser menor que 1% |
| `http_req_duration: ["p(99)<1000"]` | 99% das requisições devem ser respondidas em menos de 1 segundo |
| `vus` | Quantidade de usuários virtuais |
| `duration` | Duração do teste |

No primeiro teste (`user.test.js`), o objetivo era entender como o sistema se comportaria ao ter 10 usuários virtuais simultâneos acessando o endpoint de criação continuamente por 10 segundos. 

### user.test.js
```js
// Configuração do teste
export const options = {
  // define thresholds
  thresholds: {
    http_req_failed: ["rate<0.01"], // http errors should be less than 1%
    http_req_duration: ["p(99)<1000"], // 99% of requests should be below 1s
  },
  vus: 10,
  duration: "10s",
};
```

| Threshold | Significado |
| -------- | ------- |
| `http_req_failed: ["rate<0.01"]` | Taxa de erros deve ser menor que 1% |
| `http_req_duration: ["p(95)<2000"]` | 95% das requisições devem ser respondidas em menos de 2 segundos |
| `http_req_duration: ["p(99)<3000"]` | 99% das requisições devem ser respondidas em menos de 3 segundos |


Este teste representa um fluxo completo do usuário: registro → login → criação de contato. A combinação de múltiplos thresholds permite validações granulares: 95% das operações devem completar em até 2s, 99% em até 3s, e no máximo 1% pode exceeder 3s. 

### contact.test.js

```js
// Configuração do teste e2e
export const options = {
  // define thresholds
  thresholds: {
    http_req_failed: ["rate<0.01"], // Taxa de erro < 1%
    http_req_duration: ["p(95)<2000"], // 95% das requisições < 2s
    http_req_duration: ["p(99)<3000"], // 99% das requisições < 3s
  },
};
```

## Checks

Foram utilizados dois tipos de validações:

1. **Verificação de status**: `loginUserResponse.status === 200`
2. **Verificação de tipo**: `typeof loginUserResponse.json().token === "string"`


### contact.test.js
```js 
  check(loginUserResponse, {
      "Verify login with status 201": (loginUserResponse) =>
        loginUserResponse.status === 200,
      "Verify token is an string": (loginUserResponse) =>
        typeof loginUserResponse.json().token == "string",
    });
```

## Helpers

Foram criados 2 helpers para reutilização de lógica comum:

### urlHelper.js

Busca a URL base a partir de variáveis de ambiente, permitindo alterações sem refatoração ou novo build:

```js
export default function getBaseUrl() {
  return __ENV.BASE_URL || "http://localhost:3000";
}
```

### userHelper.js

Encapsula operações do endpoint de usuários para reutilização nos testes:

```js
createUser = (userBody) => {
    const createUserResponse = http.post(`${getBaseUrl()}/register`, userBody, {
      headers: { "Content-Type": "application/json" },
    });
    return createUserResponse;
  };

  loginUser = (userBody) => {
    const loginUserResponse = http.post(`${getBaseUrl()}/login`, userBody, {
      headers: { "Content-Type": "application/json" },
    });
    return loginUserResponse;
  };
```

## Trends
Eu utilizei a trend completeFlowDuration, para verificar a quantidade de tempo no ponto de vista do usuário para realizar todas as ações do fluxo. Com a trend criada pude customizar a validação e incluir uma nova métrica que não estava sendo coberta. 

```js
let completeFlowDuration = new Trend("completeFlowDuration");

 // Capture the duration of the entire flow on completeFlowDuration Trend
const start = Date.now();
...

const flowDuration = Date.now() - start;
completeFlowDuration.add(flowDuration);
```


## Faker

A biblioteca Faker foi utilizada para gerar dados aleatórios nos testes:

```js
import faker from "k6/x/faker";

let contactBody = JSON.stringify({
  name: faker.person.name(),
  phone: faker.person.phone(),
});
```

## Variável de Ambiente
Foi criado um arquivo .env para salvar as informações sensíveis e url`s importantes. Quando a aplicação estiver publicada em um ambiente de nuvem, podemos apenas alterar a BASE_URL nesse arquivo e com isso executar os testes apontando para o novo ambiente sem necessitar de nenhuma alteração de código. Importante, lembrar que essas variáveis de ambiente também estão adicionadas no github para executar a pipeline de testes.  

```env
BASE_URL=http://localhost:3000
K6_CLOUD_TOKEN=cloudTokenAqui
K6_CLOUD_PROJECT_ID=ProjectIdAqui
```

Quando a aplicação for implantada em ambiente de nuvem, basta alterar `BASE_URL` para apontar para o novo servidor. Essas variáveis também são configuradas no GitHub Actions para a execução da pipeline de testes.


## Stages

Os stages simulam diferentes padrões de carga em fases:

```js
stages: [
  { duration: "3s", target: 10 },   // Ramp up: subida gradual
  { duration: "15s", target: 10 },  // Estável: uso normal
  { duration: "2s", target: 100 },  // Pico 1: aumento rápido
  { duration: "3s", target: 100 },  // Pico 2: mantém o pico
  { duration: "5s", target: 10 },   // Redução: volta ao normal
  { duration: "5s", target: 0 },    // Ramp down: encerramento
],
```

Este padrão simula um cenário realista: crescimento de usuários, período estável, picos de uso, redução e finalização. 

## Uso de Token de Autenticação e Reaproveitamento de Resposta

O token obtido na resposta de login é extraído e reutilizado em requisições subsequentes:

1. **Extração do token**: `userToken = loginUserResponse.json("token");`
2. **Reutilização**: `Authorization: Bearer ${userToken}`

### contact.test.js
```js
group(`Login with user`, () => {
    const loginUserResponse = new UserHelper().loginUser(userBody);
    userToken = loginUserResponse.json("token");
    ...
  });

  group(`Create contact`, () => {
    const createContactResponse = http.post(
      `${getBaseUrl()}/contacts`,
      contactBody,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
      },
    );
  });
```

## Data-Driven Testing

Um arquivo JSON fixture contém dados padrão reutilizados em múltiplos testes:

```js
const defaultContact = JSON.parse(open("./fixture/emergenciaPolicial.json"));
const response = createContact(userToken, defaultContact);
```

Esta abordagem garante consistência nos testes e facilita a manutenção de dados de teste.

## Groups

Os groups organizam as operações em fases lógicas, facilitando a leitura dos resultados e manutenção do código:

```js
group("Registrar usuário", () => {
  // Operações de registro
});

group("Login do usuário", () => {
  // Operações de autenticação
});

group("Criar contato", () => {
  // Operações de criação
});
```

Cada grupo gera métricas separadas no relatório, permitindo análise granular de performance.