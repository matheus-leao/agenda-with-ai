const express = require('express');
const contactController = require('./controller/contactController');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');

const app = express();
app.use(express.json());

app.post('/contacts', contactController.createContact);
app.get('/contacts', contactController.listContacts);
app.put('/contacts', contactController.updateContact);
app.delete('/contacts', contactController.deleteContact);

// Swagger endpoint
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

module.exports = app;
