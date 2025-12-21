# Testes de Performance utilizando o K6

Os testes estão salvos na pasta tests/k6. nela contém os arquivos de teste e os helpers utilizados nos testes. Abaixo detalharei todos os conceitos empregados e seus respectivos trechos de código:

## Thresholds
No projeto utilizei alguns thresholds. 


| Thresholds | Significado|
| -------- | ------- |
| http_req_failed: ["rate<0.01"] | Quantidade de erros nos requests http deve ser menor que 1%|
| http_req_duration: ["p(99)<1000"] | Quantidade de requests que excede o tempo de resposta de 1 segundo deve ser menor que 99%|
| vus | Quantidade de usuários virtuais|
| duration | Duração do teste|

No primeiro teste o objetivo era entender como o sistema se comportaria ao ter um pico de 10 usuários virtuais acessando ao endpoint de criação por um período controlado sem interrupção. 

### user.test.js
```js 

// define configuration
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

| Thresholds | Significado|
| -------- | ------- |
| http_req_failed: ["rate<0.01"] | Quantidade de erros nos requests http deve ser menor que 1%|
| http_req_duration: ["p(95)<2000"] | Quantidade de requests que excede o tempo de resposta de 2 segundos deve ser menor que 95%|
| http_req_duration: ["p(99)<3000"] | Quantidade de requests que excede o tempo de resposta de 3 segundos deve ser menor que 99%|


Nesse teste temos a representação de um fluxo e2e do usuário, criando um usuário, realizando o login com o usuário criado e criando um contato em sua agenda. Para isso utilizei a combinação de 2 diferentes thresholds. Assim 95% dos usuários tem um tempo de resposta inferior a 2 segundos, era aceitável que 5% dos usuários tivessem seu tempo de resposta entre 2 e 3 segundos, e apenas 1% dos usuários pudessem ter seu tempo de resposta superior a 3 segundos. 

### contact.test.js
```js 

// define configuration
export const options = {
  // define thresholds
  thresholds: {
    http_req_failed: ["rate<0.01"], // http errors should be less than 1%
    http_req_duration: ["p(99)<3000"], // 99% of requests should be below 3s
    http_req_duration: ["p(95)<2000"], // 99% of requests should be below 2s
  },

};
```

## Checks
Eu utilizei 2 tipos de checks no projeto, checks para verificar o status da resposta como ``` loginUserResponse.status === 200 ``` e verificação do conteúdo da resposta e seu respectivo tipo ```typeof loginUserResponse.json().token == "string",```.


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
Eu criei 2 helpers para o projeto:

```urlHelper.js``` tem o objetivo de buscar a url base em um arquivo de configuração (.env) permitindo que informações sensíveis possam ser facilmente alteradas sem necessitar de grande refatoração ou um novo build. 

```js
export default function getBaseUrl() {
  return __ENV.BASE_URL || "http://localhost:3000";
}
```

```userHelper``` tem o objetivo de encapsular alguns comportamentos do endpoint de usuários para ser reutilizado com maior facilidade pelos arquivos de teste. 
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

### contact.test.js
Eu importei a biblioteca do faker sugerida para o k6, e utilizei as funções de name e phone para criar um novo contato. 

```js
import faker from "k6/x/faker";

...

let contactBody = JSON.stringify({
      name: faker.person.name(),
      phone: faker.person.phone(),
    });

```

## Variável de Ambiente
Foi criado um arquivo .env para salvar as informações sensíveis e url`s importantes. Quando a aplicação estiver publicada em um ambiente de nuvem, podemos apenas alterar a BASE_URL nesse arquivo e com isso executar os testes apontando para o novo ambiente sem necessitar de nenhuma alteração de código. Importante, lembrar que essas variáveis de ambiente também estão adicionadas no github para executar a pipeline de testes.  

```.env
BASE_URL=http://localhost:3000
K6_CLOUD_TOKEN=cloudTokenAqui
K6_CLOUD_PROJECT_ID=ProjectIdAqui
```


## Stages
No projeto utilizei Stages no arquivo abaixo. 

### contact.test.js
```js 
  stages: [
    { duration: "3s", target: 10 }, // Ramp up
    { duration: "15s", target: 10 }, // Average
    { duration: "2s", target: 100 }, // Spike
    { duration: "3s", target: 100 }, // Spike
    { duration: "5s", target: 10 }, // Average
    { duration: "5s", target: 0 }, // Ramp down
  ],
```
Dessa forma pude representar um ramp up de 3 segundos com 10 usuários virtuais, uma média de uso de 15 segundos ainda com 10 usuários, um pico de 100 usuários durante 2 segundos e depois mais um pico de 100 usuários durante 3 segundos. Após isso, voltamos a utilização média de 10 usuários e finalizamos o teste com 0. 

## Uso de Token de Autenticação e Reaproveitamento de Resposta

No primeiro grupo eu realizo o login com o usuário criado, extraio o token da resposta com o método ```loginUserResponse.json("token");``` e salvo em uma variável ```userToken```, representando o reaproveitamento de resposta. 
No segundo grupo Create contact eu utilizo o token extraído para criar um contato ```Authorization: `Bearer ${userToken}` ```.

### contact.test.js
```js
group(`Login with user`, () => {
    const loginUserResponse = new UserHelper().loginUser(userBody);
    userToken = loginUserResponse.json("token");
    ...
  });

  group(`Create contact`, () => {
    ...

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
```

## Data-Driven Testing

Foi criado um arquivo json contendo um contato default para que pudesse ser adicionado em todos os novos usuários cadastrados. Eu realizei a importação para uma variável e utilizei ela como o body do request.

### contact.test.js
```js 
const baseFile = JSON.parse(open("./fixture/emergenciaPolicial.json"))

const createDefaultContactResponse = createContact(userToken, defaultContact)
```

## Groups

Utilizei os groups para organizar os testes e os resultados já que busquei no contact.test.js representar um fluxo completo do usuário.

### contact.test.js
```js 
group(`Register user`, () => { 
});

group(`Login with user`, () => {
});

group(`Create contact`, () => {
});
```