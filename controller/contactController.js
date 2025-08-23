const contactService = require('../service/contactService');

function createContact(req, res) {
  const { name, phone } = req.body;
  if (!name || !phone) {
    return res.status(400).json({ error: 'Nome e telefone são obrigatórios.' });
  }
  try {
    const contact = contactService.addContact(name, phone);
    res.status(201).json(contact);
  } catch (err) {
    res.status(409).json({ error: err.message });
  }
}

function listContacts(req, res) {
  const contacts = contactService.getContacts();
  res.json(contacts);
}

function updateContact(req, res) {
  const { name, phone } = req.body;
  if (!name || !phone) {
    return res.status(400).json({ error: 'Nome e telefone são obrigatórios.' });
  }
  try {
    const contact = contactService.updateContact(name, phone);
    res.json(contact);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
}

function deleteContact(req, res) {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Nome é obrigatório.' });
  }
  try {
    contactService.deleteContact(name);
    res.status(204).send();
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
}

module.exports = {
  createContact,
  listContacts,
  updateContact,
  deleteContact
};
