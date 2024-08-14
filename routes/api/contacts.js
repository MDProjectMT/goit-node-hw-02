import express from "express";
import {
  listContacts,
  getContactById,
  removeContact,
} from "../../models/contacts.js";

const router = express.Router();

router.get("/contacts", async (_req, res, next) => {
  try {
    const allContacts = await listContacts();
    res.json({
      status: "success",
      message: "Pobrano całą listę kontaktów!!",
      data: allContacts,
    });
  } catch (error) {
    next(error);
  }
});

router.get("/contacts/:contactId", async (req, res, next) => {
  try {
    const contact = await getContactById(req.params.contactId);
    console.log(req.params);
    if (contact) {
      res.json({
        status: "success",
        message: `Wyszukiwanie kontaktu po ID, Id kontaktu "${req.params.contactId}`,
        data: contact,
      });
    } else {
      res.status(404).json({
        status: "error",
        message: "Nie znaleziono kontaktu o podanym ID",
      });
    }
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  res.json({ message: "template message" });
});

router.delete("/contacts/:contactId", async (req, res, next) => {
  try {
    const contact = await removeContact(req.params.contactId);
    if (contact) {
      res.json({
        status: "success",
        message: "contact deleted",
        data: contact,
      });
    } else {
      res.status(404).json({
        status: "error",
        message: "Not found",
      });
    }
  } catch (error) {
    next(error);
  }
});

router.put("/:contactId", async (req, res, next) => {
  res.json({ message: "template message" });
});

export default router;
