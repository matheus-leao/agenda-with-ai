const express = require('express');
const contactController = require('./controller/contactController');
const authController = require('./controller/authController');
const authenticate = require('./authMiddleware');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');

const app = express();
app.use(express.json());

// Auth routes
app.post('/register', authController.register);
app.post('/login', authController.login);

// Contact routes (protected)
app.post('/contacts', authenticate, contactController.createContact);
app.get('/contacts', authenticate, contactController.listContacts);
app.put('/contacts', authenticate, contactController.updateContact);
app.delete('/contacts', authenticate, contactController.deleteContact);

// Swagger endpoint
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

module.exports = app;
