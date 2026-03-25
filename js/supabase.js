// ===============================
// SUPABASE CONFIG
// ===============================
const SUPABASE_URL = "https://gtujlykdrfwqbdschsya.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_ypgOpoGy5hn1CVAGfFPvkw_SuWj4k1c";

const { createClient } = window.supabase;
const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ===============================
// AUTH SYSTEM
// ===============================
const Auth = {
  async login(email, password) {
    const { data, error } = await db.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error(error);
      alert("Login failed");
      return null;
    }

    return data.user;
  },

  async logout() {
    await db.auth.signOut();
    window.location.href = "../index.html";
  },

  async getUser() {
    const { data: { user } } = await db.auth.getUser();
    return user;
  },

  async requireAuth() {
    const { data: { session } } = await db.auth.getSession();

    if (!session) {
      window.location.href = "../index.html";
      return null;
    }

    return session.user;
  }
};

// ===============================
// MENU API
// ===============================
const Menu = {
  async getAll() {
    const { data, error } = await db
      .from("menu_items")
      .select("*")
      .order("name");

    if (error) {
      console.error("Menu error:", error);
      return [];
    }

    return data;
  }
};

// ===============================
// BILLS API
// ===============================
const Bills = {
  async getAll() {
    const { data, error } = await db
      .from("bills")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Bills error:", error);
      return [];
    }

    return data;
  },

  async create(bill) {
    const { data, error } = await db
      .from("bills")
      .insert([bill]);

    if (error) {
      console.error(error);
      alert("Failed to save bill");
    }

    return data;
  }
};

// ===============================
// REPORTS API
// ===============================
const Reports = {
  async getSummary(from, to) {
    const { data, error } = await db
      .from("bills")
      .select("*")
      .gte("bill_date", from)
      .lte("bill_date", to);

    if (error) {
      console.error(error);
      return { totalSales: 0, billCount: 0 };
    }

    const totalSales = data.reduce((sum, b) => sum + Number(b.total), 0);
    const billCount = data.length;

    return { totalSales, billCount };
  }
};
