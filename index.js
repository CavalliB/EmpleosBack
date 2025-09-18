const express = require("express");
const fs = require("fs");
const cors = require("cors");

const app = express();
app.use(express.static("dist"));
app.use(cors());
app.use(express.json());

const DB_FILE = "./dist/db.json";

// Leer db.json
const readDB = () => {
  try {
    const data = fs.readFileSync(DB_FILE, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    // Si no existe db.json, inicializamos vacío
    return { ad: [], company: [] };
  }
};

// Guardar en db.json
const writeDB = (data) => {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
};

// ---------------- AD ----------------

app.get("/api/ad", (req, res) => {
  const db = readDB();
  res.json(db.ad);
});

app.get("/api/ad/:id", (req, res) => {
  const db = readDB();
  const id = Number(req.params.id);
  const foundAd = db.ad.find((a) => a.id === id);

  if (foundAd) res.json(foundAd);
  else res.status(404).end();
});

app.delete("/api/ad/:id", (req, res) => {
  const db = readDB();
  const id = Number(req.params.id);
  db.ad = db.ad.filter((a) => a.id !== id);
  writeDB(db);
  res.status(204).end();
});

app.post("/api/ad", (req, res) => {
  const db = readDB();
  const body = req.body;

  if (
    !body.title ||
    !body.description ||
    !body.location ||
    !body.type ||
    !body.time ||
    !body.company ||
    !body.date
  ) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const newAd = {
    id: db.ad.length > 0 ? Math.max(...db.ad.map((a) => a.id)) + 1 : 1,
    ...body,
  };

  db.ad.push(newAd);
  writeDB(db);
  res.json(newAd);
});

// ---------------- COMPANY ----------------

app.get("/api/company", (req, res) => {
  const db = readDB();
  res.json(db.company);
});

app.get("/api/company/:id", (req, res) => {
  const db = readDB();
  const id = Number(req.params.id);
  const foundCompany = db.company.find((c) => c.id === id);

  if (foundCompany) res.json(foundCompany);
  else res.status(404).end();
});

app.delete("/api/company/:id", (req, res) => {
  const db = readDB();
  const id = Number(req.params.id);
  db.company = db.company.filter((c) => c.id !== id);
  writeDB(db);
  res.status(204).end();
});

app.post("/api/company", (req, res) => {
  const db = readDB();
  const body = req.body;

  if (!body.name) {
    return res.status(400).json({ error: "Name field is required" });
  }

  if (db.company.find((c) => c.name === body.name)) {
    return res.status(400).json({ error: "Name must be unique" });
  }

  const newCompany = {
    id:
      db.company.length > 0 ? Math.max(...db.company.map((c) => c.id)) + 1 : 1,
    name: body.name,
  };

  db.company.push(newCompany);
  writeDB(db);
  res.json(newCompany);
});

// ---------------- SERVER ----------------

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
