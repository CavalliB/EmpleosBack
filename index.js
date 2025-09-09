const express = require("express");
const app = express();
//app.use(express.static('dist'))
//const cors = require('cors')

//app.use(cors())

app.use(express.json());

let Empleo = [
  {
    id: 1,
    name: "analista",
    descripcion: "analizar cosas",
    ubicacion: "Malvinas",
    type: "Remote",
    tiempo: "Full-Time",
    empresa: "SYS",
    Fecha: "09/09/2025"
  },

];

app.get("/api/Ad", (request, response) => {
  if (Empleo) {
    response.json(Empleo);
  } else {
    response.status(404).end();
  }
});

app.get("/api/Ad/:id", (request, response) => {
  const id = Number(request.params.id);
  const empleo = Empleo.find((empleo) => empleo.id === id);
  
  if (empleo) {
    response.json(empleo);
  } else {
    response.status(404).end();
  }
});

app.delete("/api/ad/:id", (request, response) => {
  const id = Number(request.params.id);
  Empleo = Empleo.filter((empleo) => empleo.id !== id);

  response.status(204).end();
});

const generateId = () => {
  const maxId = Empleo.length > 0 ? Math.max(...Empleo.map((n) => n.id)) : 0;
  return maxId + 1;
};

app.post("/api/ad", (request, response) => {
  const body = request.body;

  if (!body.name || !body.descripcion || !body.ubicacion || !body.type || !body.tiempo || !body.empresa || !body.Fecha) {
    return response.status(400).json({
      error: "All fields are required",
    });
  }

  const empleo = {
    id: generateId(),
    name: body.name,
    descripcion: body.descripcion,
    ubicacion: body.ubicacion,
    type: body.type,
    tiempo: body.tiempo,
    empresa: body.empresa,
    Fecha: body.Fecha
  };

  Empleo = Empleo.concat(empleo);

  response.json(empleo);
});

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});