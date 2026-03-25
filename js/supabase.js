// ===============================
// SUPABASE CONFIG
// ===============================
const SUPABASE_URL = "https://gtujlykdrfwqbdschsya.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_ypgOpoGy5hn1CVAGfFPvkw_SuWj4k1c";

const { createClient } = window.supabase;
const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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
