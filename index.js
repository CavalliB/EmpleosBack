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
    company:company_id (name)
  `);// accede a la tabla company y trae el name
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
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

  const { data, error } = await supabase.from("ad").insert([body]).select();
  if (error) return res.status(500).json({ error: error.message });

  res.json(data[0]);
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
