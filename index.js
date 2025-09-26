require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");

const app = express();
app.use(express.static("dist"));
app.use(cors());
app.use(express.json());

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY 
);

// ---------------- AD ----------------

app.get("/api/ad", async (req, res) => {
  const { data, error } = await supabase.from("ad").select(`
    id,
    title,
    description,
    location,
    type,
    time,
    date,
    company (name)
  `);// accede a la tabla company y trae el name
  if (error) return res.status(500).json({ error: error.message });

  const ads = data.map(ad => ({
  ...ad,
  company: ad.company?.name?.trim() || null
}));
  res.json(ads);
});
                                                                        
app.get("/api/ad/:id", async (req, res) => {
  const { data, error } = await supabase
    .from("ad")
    .select("*")
    .eq("id", req.params.id)
    .single();

  if (error && error.code === "PGRST116") return res.status(404).end();
  if (error) return res.status(500).json({ error: error.message });

  res.json(data);
});


app.delete("/api/ad/:id", async (req, res) => {
  const { error } = await supabase.from("ad").delete().eq("id", req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.status(204).end();
});


app.post("/api/ad", async (req, res) => {
  const { title, description, location, type, time, company, date } = req.body;

  if (!title || !description || !location || !type || !time || !company || !date) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    // 1. Buscar si la empresa ya existe
    let { data: existingCompany, error: searchError } = await supabase
      .from("company")
      .select("id")
      .eq("name", company.trim())
      .maybeSingle();

    if (searchError) {
      return res.status(500).json({ error: searchError.message });
    }

    let companyId;

    if (existingCompany) {
      // 2a. Si existe, usar su ID
      companyId = existingCompany.id;
    } else {
      // 2b. Si no existe, crear nueva empresa
      const { data: newCompany, error: createCompanyError } = await supabase
        .from("company")
        .insert([{ name: company.trim() }])
        .select("id")
        .single();

      if (createCompanyError) {
        return res.status(500).json({ error: createCompanyError.message });
      }
console.log(companyId)

      companyId = newCompany.id;
    }
console.log(companyId)
    // 3. Crear el anuncio con el company_id
    const { data: newAd, error: createAdError } = await supabase
      .from("ad")
      .insert([{
        title,
        description,
        location,
        type,
        time,
        company: companyId, // Aquí guardamos el ID, no el nombre
        date
      }])
      .select(`
        id,
        title,
        description,
        location,
        type,
        time,
        date,
        company (name)
      `)
      .single();

    if (createAdError) {
      return res.status(500).json({ error: createAdError.message });
    }

    // 4. Formatear la respuesta para que coincida con el formato esperado por el frontend
    const formattedAd = {
      ...newAd,
      company: newAd.company?.name || null
    };

    res.json(formattedAd);

  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// ---------------- COMPANY ----------------


app.get("/api/company", async (req, res) => {
  const { data, error } = await supabase.from("company").select("*");
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.get("/api/company/:id", async (req, res) => {
  const { data, error } = await supabase
    .from("company")
    .select("*")
    .eq("id", req.params.id)
    .single();

  if (error && error.code === "PGRST116") return res.status(404).end();
  if (error) return res.status(500).json({ error: error.message });

  res.json(data);
});

app.delete("/api/company/:id", async (req, res) => {
  const { error } = await supabase
    .from("company")
    .delete()
    .eq("id", req.params.id);

  if (error) return res.status(500).json({ error: error.message });
  res.status(204).end();
});


app.post("/api/company", async (req, res) => {
  const body = req.body;

  if (!body.name) {
    return res.status(400).json({ error: "Name field is required" });
  }

  // Validar unicidad
  const { data: existing, error: errorExisting } = await supabase
    .from("company")
    .select("*")
    .eq("name", body.name)
    .maybeSingle();

  if (errorExisting) return res.status(500).json({ error: errorExisting.message });
  if (existing) {
    return res.status(400).json({ error: "Name must be unique" });
  }

  const { data, error } = await supabase
    .from("company")
    .insert([{ name: body.name }])
    .select();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data[0]);
});

// ---------------- SERVER ----------------
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
