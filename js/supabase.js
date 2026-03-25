// ===============================
// SUPABASE CONFIG
// ===============================
const SUPABASE_URL = "https://gtujlykdrfwqbdschsya.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0dWpseWtkcmZ3cWJkc2Noc3lhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQzMTc4MjMsImV4cCI6MjA4OTg5MzgyM30.Mahmwd7TwW9A20B3ksDqCBfOS5E4lqcBiZ2wRLQRlJk";
const db = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

// ===============================
// MENU API (FULL FIX)
// ===============================
const Menu = {

  async getAll() {
    const { data, error } = await db
      .from("menu_items")
      .select("*")
      .order("name");

    if (error) throw error;
    return data;
  },

  async create(item) {
    const { error } = await db
      .from("menu_items")
      .insert([item]);

    if (error) throw error;
  },

  async update(id, item) {
    const { error } = await db
      .from("menu_items")
      .update(item)
      .eq("id", id);

    if (error) throw error;
  },

  async delete(id) {
    const { error } = await db
      .from("menu_items")
      .delete()
      .eq("id", id);

    if (error) throw error;
  }
};

// ===============================
// AUTH FIX
// ===============================
const Auth = {
  async requireAuth() {
    const { data: { session } } = await db.auth.getSession();
    if (!session) {
      window.location.href = "../index.html";
      return null;
    }
    return session.user;
  },

  async getUser() {
    const { data: { user } } = await db.auth.getUser();
    return user;
  },

  async logout() {
    await db.auth.signOut();
    window.location.href = "../index.html";
  }
};
