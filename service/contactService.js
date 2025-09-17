const { contacts } = require("../model/contactModel");

function addContact(name, phone) {
  if (contacts.some((c) => c.name === name)) {
    throw new Error("Contato já cadastrado.");
  }
  const contact = { name, phone };
  contacts.push(contact);
  return contact;
}

function getContacts() {
  return contacts;
}

function updateContact(name, newPhone) {
  const contact = contacts.find((c) => c.name === name);
  if (!contact) throw new Error("Contato não encontrado.");
  contact.phone = newPhone;
  return contact;
}

function deleteContact(name) {
  const index = contacts.findIndex((c) => c.name === name);
  if (index === -1) throw new Error("Contato não encontrado.");
  contacts.splice(index, 1);
}

module.exports = {
  addContact,
  getContacts,
  updateContact,
  deleteContact,
};
