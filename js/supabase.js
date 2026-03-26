// ===============================
// SUPABASE CONFIG
// ===============================
const SUPABASE_URL = APP_CONFIG."https://gtujlykdrfwqbdschsya.supabase.co";
const SUPABASE_ANON_KEY = APP_CONFIG."eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0dWpseWtkcmZ3cWJkc2Noc3lhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQzMTc4MjMsImV4cCI6MjA4OTg5MzgyM30.Mahmwd7TwW9A20B3ksDqCBfOS5E4lqcBiZ2wRLQRlJk";

const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ===============================
// AUTH
// ===============================
const Auth = {
  async requireAuth() {
    try {                                                      // ✅ FIX 1: wrap in try/catch
      const { data: { session }, error } = await db.auth.getSession();
      if (error || !session) {
        window.location.href = "/index.html";                 // ✅ FIX 2: absolute path
        return null;
      }
      return session.user;
    } catch (e) {
      console.error("Auth error:", e);
      window.location.href = "/index.html";                   // ✅ FIX 3: catch network errors
      return null;
    }
  },

  async getUser() {
    const { data: { user } } = await db.auth.getUser();
    return user;
  },

  async logout() {
    await db.auth.signOut();
    window.location.href = "/index.html";                     // ✅ FIX 4: absolute path
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
    if (error) throw error;
    return data || [];
  },

  async getAvailable() {
    const { data, error } = await db
      .from("menu_items")
      .select("*")
      .eq("available", true)
      .order("category")
      .order("name");
    if (error) throw error;
    return data || [];
  },

  async create(item) {
    const { data, error } = await db
      .from("menu_items")
      .insert([item])
      .select()
      .single();
    if (error) throw error;
    return data;
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
// BILLS API
// ===============================
const Bills = {

  async generateBillNumber() {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, "");

    const { data, error } = await db
      .from("bills")
      .select("bill_number")
      .like("bill_number", `BL${dateStr}%`)
      .order("bill_number", { ascending: false })
      .limit(1);

    if (error) throw error;

    let seq = 1;
    if (data && data.length > 0) {
      const last = data[0].bill_number;
      const lastSeq = parseInt(last.slice(-4));
      if (!isNaN(lastSeq)) seq = lastSeq + 1;
    }

    return `BL${dateStr}${String(seq).padStart(4, "0")}`;
  },

  async create(billData, cartItems) {
    const subtotal = cartItems.reduce((s, i) => s + i.line_total, 0);

    const { data: bill, error: billError } = await db
      .from("bills")
      .insert([{
        bill_number:  billData.bill_number,
        bill_date:    new Date().toISOString().slice(0, 10),
        bill_time:    new Date().toLocaleTimeString("en-IN", {
                        hour: "2-digit", minute: "2-digit",
                        second: "2-digit", hour12: false
                      }),
        subtotal:     subtotal,
        total:        subtotal,
        total_profit: 0
      }])
      .select()
      .single();

    if (billError) throw billError;

    const items = cartItems.map(item => ({
      bill_id:       bill.id,
      item_id:       item.item_id,
      item_name:     item.item_name,
      quantity:      item.quantity,
      selling_price: item.selling_price,
      line_total:    item.line_total
    }));

    const { error: itemsError } = await db
      .from("bill_items")
      .insert(items);

    if (itemsError) throw itemsError;

    return bill;
  },

  async getAll() {
    const { data, error } = await db
      .from("bills")
      .select(`
        *,
        bill_items (*)
      `)
      .order("bill_date", { ascending: false })
      .order("bill_time", { ascending: false })
      .limit(200);

    if (error) throw error;
    return data || [];
  },

  async getById(id) {
    const { data, error } = await db
      .from("bills")
      .select(`
        *,
        bill_items (*)
      `)
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  },

  async getByDateRange(from, to) {
    const { data, error } = await db
      .from("bills")
      .select(`
        *,
        bill_items (*)
      `)
      .gte("bill_date", from)
      .lte("bill_date", to)
      .order("bill_date", { ascending: false })
      .order("bill_time", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async delete(id) {
    const { error: itemsError } = await db
      .from("bill_items")
      .delete()
      .eq("bill_id", id);

    if (itemsError) throw itemsError;

    const { error } = await db
      .from("bills")
      .delete()
      .eq("id", id);

    if (error) throw error;
  }
};

// ===============================
// REPORTS API
// ===============================
const Reports = {

  async getSummary(from, to) {
    const { data, error } = await db
      .from("bills")
      .select("total, total_profit, bill_date")
      .gte("bill_date", from)
      .lte("bill_date", to);

    if (error) throw error;

    const bills       = data || [];
    const totalSales  = bills.reduce((s, b) => s + Number(b.total        || 0), 0);
    const totalProfit = bills.reduce((s, b) => s + Number(b.total_profit || 0), 0);

    return { totalSales, totalProfit, billCount: bills.length };
  },

  async getTopItems(from, to, limit = 10) {
    const { data, error } = await db
      .from("bill_items")
      .select(`
        item_name,
        quantity,
        line_total,
        bills!inner (bill_date)
      `)
      .gte("bills.bill_date", from)
      .lte("bills.bill_date", to);

    if (error) throw error;

    const map = {};
    (data || []).forEach(row => {
      if (!map[row.item_name]) {
        map[row.item_name] = { item_name: row.item_name, qty: 0, revenue: 0 };
      }
      map[row.item_name].qty     += Number(row.quantity   || 0);
      map[row.item_name].revenue += Number(row.line_total || 0);
    });

    return Object.values(map)
      .sort((a, b) => b.qty - a.qty)
      .slice(0, limit);
  }
};

// ===============================
// SETTINGS API
// ===============================
const Settings = {

  async get(key) {
    const { data, error } = await db
      .from("settings")
      .select("value")
      .eq("key", key)
      .single();

    if (error) return null;
    return data?.value || null;
  },

  async set(key, value) {
    const { error } = await db
      .from("settings")
      .upsert({ key, value }, { onConflict: "key" });

    if (error) throw error;
  },

  async getAll() {
    const { data, error } = await db
      .from("settings")
      .select("*");

    if (error) throw error;

    const obj = {};
    (data || []).forEach(row => { obj[row.key] = row.value; });
    return obj;
  }
};
