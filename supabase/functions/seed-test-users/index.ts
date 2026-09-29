import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const DOMAIN = "seed.growhub.test";
const PASSWORD = "SeedTest!2026#GrowHub";
const ROLES = ["startup","mentor","investor","expert","freelance","incubateur","etudiant","aspirationnel","professionnel","corporate"];
const FIRST = ["Awa","Moussa","Fatou","Ibrahima","Aminata","Kofi","Ngozi","Youssef","Mariam","Cheikh","Aïcha","Oumar","Khadija","Seydou","Adama","Nadia","Kwame","Salif","Binta","Tidiane"];
const LAST = ["Diop","Traoré","Ndiaye","Koné","Mensah","Okafor","Benali","Sow","Camara","Diallo","Touré","Ba","Keita","Asante","Fall","Sy"];
const CITIES = [["Dakar","Sénégal"],["Abidjan","Côte d'Ivoire"],["Lagos","Nigeria"],["Accra","Ghana"],["Casablanca","Maroc"],["Nairobi","Kenya"],["Bamako","Mali"],["Douala","Cameroun"],["Tunis","Tunisie"],["Kigali","Rwanda"]];
const SECTORS = ["Fintech","Agritech","Healthtech","Edtech","E-commerce","Énergie","Logistique","Mobilité"];
const SKILLS = ["Levée de fonds","Marketing digital","Produit","Finance","Juridique","Tech","Ventes","RH"];
const POSTS = [
  "Nous venons de dépasser 1 000 clients actifs ! Merci à toute l'équipe #croissance",
  "Qui a déjà levé en pré-seed en Afrique de l'Ouest ? Je cherche des conseils #fundraising",
  "Ressource utile : notre modèle de pitch deck en 10 slides #ressource",
  "Retour d'expérience sur le paiement mobile money pour une marketplace #fintech",
  "Nous recrutons un CTO passionné par l'agritech à Dakar #recrutement",
  "Leçon du jour : parler à 50 clients avant d'écrire une ligne de code #produit",
];
const pick = <T,>(a: T[], i: number) => a[i % a.length];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  try {
    const { action, offset = 0, count = 50 } = await req.json();
    const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    const seedIds = async () => {
      const ids: { id: string; n: number }[] = [];
      for (let page = 1; page < 50; page++) {
        const { data } = await db.auth.admin.listUsers({ page, perPage: 1000 });
        const u = data?.users ?? [];
        u.filter((x) => x.email?.endsWith("@" + DOMAIN)).forEach((x) => ids.push({ id: x.id, n: Number(x.email!.split("@")[0].replace("seed", "")) }));
        if (u.length < 1000) break;
      }
      return ids.sort((a, b) => a.n - b.n);
    };

    if (action === "users") {
      let created = 0;
      for (let n = offset; n < Math.min(offset + Math.min(count, 60), 500); n++) {
        const role = pick(ROLES, n);
        const name = `${pick(FIRST, n)} ${pick(LAST, Math.floor(n / 3))}`;
        const { data, error } = await db.auth.admin.createUser({ email: `seed${n}@${DOMAIN}`, password: PASSWORD, email_confirm: true, user_metadata: { full_name: name, is_test_seed: true } });
        if (error) continue;
        const id = data.user.id;
        const [city, country] = pick(CITIES, n);
        await db.from("profiles").update({
          headline: `${role} · ${pick(SECTORS, n)}`, bio: `Membre de test GrowHub basé à ${city}.`,
          company_name: `${pick(LAST, n)} ${pick(SECTORS, n + 1)}`, sector: pick(SECTORS, n), city, country,
          skills: [pick(SKILLS, n), pick(SKILLS, n + 3)], interests: [pick(SECTORS, n + 2)],
          looking_for: [pick(SKILLS, n + 1)], offering: [pick(SKILLS, n + 4)],
          onboarding_completed: true, onboarding_step: 99, is_public: true,
        }).eq("user_id", id);
        if (role !== "startup") await db.from("user_roles").update({ role }).eq("user_id", id);
        if (role === "mentor" || role === "expert")
          await db.from("coaches").insert({ user_id: id, specialties: [pick(SKILLS, n)], hourly_rate: 15000 + (n % 5) * 5000, currency: "XOF", bio: "Coach de test", languages: ["Français"] });
        created++;
      }
      return json({ created });
    }

    if (action === "content") {
      const ids = await seedIds();
      const slice = ids.slice(offset, offset + count);
      const { data: coaches } = await db.from("coaches").select("id,user_id").in("user_id", ids.map((x) => x.id));
      for (const [k, u] of slice.entries()) {
        const i = offset + k;
        await db.from("posts").insert([0, 1].map((j) => ({ author_id: u.id, content: pick(POSTS, i + j) })));
        const peers = [1, 2, 3].map((d) => ids[(i + d) % ids.length]).filter((p) => p && p.id !== u.id);
        for (const p of peers) {
          await db.from("connections").insert({ requester_id: u.id, receiver_id: p.id, status: "accepted", match_score: 60 + (i % 40) });
          await db.from("messages").insert([{ sender_id: u.id, receiver_id: p.id, content: "Bonjour ! Ravi de rejoindre votre réseau." }, { sender_id: p.id, receiver_id: u.id, content: "Avec plaisir, échangeons bientôt !" }]);
        }
        if (coaches?.length) {
          const c = coaches[i % coaches.length];
          if (c.user_id !== u.id) await db.from("coaching_sessions").insert({ coach_id: c.id, learner_id: u.id, scheduled_at: new Date(Date.now() + (i % 14 + 1) * 864e5).toISOString(), topic: "Stratégie de croissance" });
        }
        if (pick(ROLES, u.n) === "startup") {
          const { data: room } = await db.from("deal_rooms").insert({ name: `Série A – dossier ${u.n}`, description: "Deal room de test", owner_id: u.id }).select("id").single();
          const inv = ids.find((x) => pick(ROLES, x.n) === "investor" && x.n > u.n) ?? ids.find((x) => pick(ROLES, x.n) === "investor");
          if (room && inv) await db.from("deal_room_members").insert({ deal_room_id: room.id, user_id: inv.id });
        }
      }
      return json({ processed: slice.length, total: ids.length });
    }

    if (action === "cleanup") {
      const ids = await seedIds();
      let deleted = 0;
      for (const u of ids.slice(0, count)) { const { error } = await db.auth.admin.deleteUser(u.id); if (!error) deleted++; }
      return json({ deleted, remaining: ids.length - deleted });
    }
    return json({ error: "action invalide" }, 400);
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});
