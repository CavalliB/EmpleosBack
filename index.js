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

    let Company = [
        {
            id: 1,
            name: "TechSA",
        },
        {
            id: 2,
            name: "SYS",
        }
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


app.get("/api/company", (request, response) => {
    if (Company) {
        response.json(Company);
    } else {
        response.status(404).end();
    }
});

app.get("/api/company/:id", (request, response) => {
    const id = Number(request.params.id);
    const company = Company.find((company) => company.id === id);

    if (company) {
        response.json(company);
    } else {
        response.status(404).end();
    }
});

app.delete("/api/company/:id", (request, response) => {
    const id = Number(request.params.id);
    Company = Company.filter((company) => company.id !== id);

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
    if (Company.find((Company) => Company.name === body.name)) {
    return response.status(400).json({
      error: "name must be unique",
    });
  }

    const company = {
        id: generateCompanyId(),
        name: body.name
    };

    Company = Company.concat(company);

    response.json(company);
});


const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});