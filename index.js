const express = require("express");
const app = express();
const cors = require("cors");

app.use(express.static("dist"));
app.use(cors());
app.use(express.json());

let ad = [];
let Company = [];

// ---------------- AD ----------------

app.get("/api/ad", (request, response) => {
  response.json(ad);
});

app.get("/api/ad/:id", (request, response) => {
  const id = Number(request.params.id);
  const foundAd = ad.find((a) => a.id === id);

  if (foundAd) {
    response.json(foundAd);
  } else {
    response.status(404).end();
  }
});

app.delete("/api/ad/:id", (request, response) => {
  const id = Number(request.params.id);
  ad = ad.filter((a) => a.id !== id);

  response.status(204).end();
});

const generateId = () => {
  const maxId = ad.length > 0 ? Math.max(...ad.map((n) => n.id)) : 0;
  return maxId + 1;
};

app.post("/api/ad", (request, response) => {
  const body = request.body;

  if (
    !body.title ||
    !body.description ||
    !body.location ||
    !body.type ||
    !body.time ||
    !body.company ||
    !body.date
  ) {
    return response.status(400).json({
      error: "All fields are required",
    });
  }

  const newAd = {
    id: generateId(),
    title: body.title,
    description: body.description,
    location: body.location,
    type: body.type,
    time: body.time,
    company: body.company,
    date: body.date,
  };

  ad = ad.concat(newAd);

  response.json(newAd);
});

// ---------------- COMPANY ----------------

app.get("/api/company", (request, response) => {
  response.json(Company);
});

app.get("/api/company/:id", (request, response) => {
  const id = Number(request.params.id);
  const foundCompany = Company.find((c) => c.id === id);

  if (foundCompany) {
    response.json(foundCompany);
  } else {
    response.status(404).end();
  }
});

app.delete("/api/company/:id", (request, response) => {
  const id = Number(request.params.id);
  Company = Company.filter((c) => c.id !== id);

  response.status(204).end();
});

const generateCompanyId = () => {
  const maxId = Company.length > 0 ? Math.max(...Company.map((n) => n.id)) : 0;
  return maxId + 1;
};

app.post("/api/company", (request, response) => {
  const body = request.body;

  if (!body.name) {
    return response.status(400).json({
      error: "Name field is required",
    });
  }

  if (Company.find((c) => c.name === body.name)) {
    return response.status(400).json({
      error: "name must be unique",
    });
  }

  const newCompany = {
    id: generateCompanyId(),
    name: body.name,
  };

  Company = Company.concat(newCompany);

  response.json(newCompany);
});

// ---------------- SERVER ----------------

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
