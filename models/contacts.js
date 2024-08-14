import { promises as fs } from "node:fs";
import path from "node:path";
import nanoid from "nanoid";

const contactsPath = path.resolve("./models/contacts.json");

const listContacts = async () => {
  try {
    await fs.access(contactsPath);
    const file = await fs.readFile(contactsPath);
    const contacts = JSON.parse(file);
    console.table(contacts);
    return contacts;
  } catch (error) {
    console.error("Wystąpił błąd podczas pobierania listy kontaktów", error);
  }
};

const getContactById = async (contactId) => {
  try {
    const contacts = await listContacts();
    const contact = contacts.find((contact) => contact.id === contactId);
    return contact;
  } catch (error) {
    console.error("Nieprawidłowe ID - error!", error);
  }
};

const removeContact = async (contactId) => {
  try {
    const contacts = await listContacts();
    const afterDelete = contacts.filter((contact) => contact.id !== contactId);
    await fs.writeFile(contactsPath, JSON.stringify(afterDelete));
    return afterDelete;
  } catch (error) {
    console.error("Not found");
  }
};

const addContact = async (body) => {
  // const contacts = listContacts();
  // const { name, email, phone } = contacts.push({
  //   id: nanoid(21),
  //   name,
  //   email,
  //   phone,
  // });
};

const updateContact = async (contactId, body) => {};

export {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
};
