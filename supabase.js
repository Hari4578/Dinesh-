// ============================================================
// supabase.js - Supabase Client Configuration
// Replace SUPABASE_URL and SUPABASE_ANON_KEY with your values
// from: https://supabase.com/dashboard → Project Settings → API
// NEVER put service_role key here - only anon key is safe in frontend
// ============================================================

const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Auth helpers
const Auth = {
  async signIn(email, password) {
    const { data, error } = await db.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },

  async signOut() {
    const { error } = await db.auth.signOut();
    if (error) throw error;
    window.location.href = '../index.html';
  },

  async getUser() {
    const { data: { user } } = await db.auth.getUser();
    return user;
  },

  async updatePassword(newPassword) {
    const { error } = await db.auth.updateUser({ password: newPassword });
    if (error) throw error;
  },

  async resetPassword(email) {
    const { error } = await db.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/pages/reset-password.html'
    });
    if (error) throw error;
  },

  // Guard: redirect to login if not authenticated
  async requireAuth() {
    const user = await this.getUser();
    if (!user) {
      window.location.href = '../index.html';
      return null;
    }
    return user;
  }
};

// Menu helpers
const Menu = {
  async getAll() {
    const { data, error } = await db.from('menu_items').select('*').order('category').order('name');
    if (error) throw error;
    return data;
  },

  async getAvailable() {
    const { data, error } = await db.from('menu_items').select('*').eq('available', true).order('category').order('name');
    if (error) throw error;
    return data;
  },

  async create(item) {
    const { data, error } = await db.from('menu_items').insert(item).select().single();
    if (error) throw error;
    return data;
  },

  async update(id, updates) {
    const { data, error } = await db.from('menu_items').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { error } = await db.from('menu_items').delete().eq('id', id);
    if (error) throw error;
  }
};

// Bills helpers
const Bills = {
  async generateBillNumber() {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    const { count } = await db.from('bills').select('*', { count: 'exact', head: true })
      .eq('bill_date', today.toISOString().slice(0, 10));
    const seq = String((count || 0) + 1).padStart(3, '0');
    return `DH${dateStr}${seq}`;
  },

  async create(billData, items) {
    const user = await Auth.getUser();
    const billNumber = await this.generateBillNumber();

    const total = items.reduce((s, i) => s + i.line_total, 0);
    const totalProfit = items.reduce((s, i) => s + i.line_profit, 0);

    const now = new Date();

    const { data: bill, error: billErr } = await db.from('bills').insert({
      bill_number: billNumber,
      bill_date: now.toISOString().slice(0, 10),
      bill_time: now.toTimeString().slice(0, 8),
      subtotal: total,
      total: total,
      total_profit: totalProfit,
      created_by: user.id
    }).select().single();

    if (billErr) throw billErr;

    const billItems = items.map(i => ({
      bill_id: bill.id,
      item_id: i.item_id || null,
      item_name: i.item_name,
      quantity: i.quantity,
      selling_price: i.selling_price,
      cost_price: i.cost_price,
      line_total: i.line_total,
      line_profit: i.line_profit
    }));

    const { error: itemsErr } = await db.from('bill_items').insert(billItems);
    if (itemsErr) throw itemsErr;

    return bill;
  },

  async getByDate(date) {
    const { data, error } = await db.from('bills').select('*, bill_items(*)').eq('bill_date', date).order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async getByDateRange(from, to) {
    const { data, error } = await db.from('bills').select('*, bill_items(*)').gte('bill_date', from).lte('bill_date', to).order('bill_date', { ascending: false }).order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async getAll() {
    const { data, error } = await db.from('bills').select('*, bill_items(*)').order('bill_date', { ascending: false }).order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async getById(id) {
    const { data, error } = await db.from('bills').select('*, bill_items(*)').eq('id', id).single();
    if (error) throw error;
    return data;
  },

  async search(query) {
    const { data, error } = await db.from('bills').select('*, bill_items(*)').ilike('bill_number', `%${query}%`).order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { error } = await db.from('bills').delete().eq('id', id);
    if (error) throw error;
  }
};

// Settings helpers
const Settings = {
  async get(key) {
    const { data, error } = await db.from('settings').select('value').eq('key', key).single();
    if (error) return null;
    return data?.value;
  },

  async getAll() {
    const { data, error } = await db.from('settings').select('*');
    if (error) throw error;
    return data;
  },

  async set(key, value) {
    const { error } = await db.from('settings').update({ value }).eq('key', key);
    if (error) throw error;
  }
};

// Reports helpers
const Reports = {
  async getSummary(from, to) {
    const { data, error } = await db.from('bills').select('total, total_profit, bill_date').gte('bill_date', from).lte('bill_date', to);
    if (error) throw error;
    const totalSales = data.reduce((s, b) => s + Number(b.total), 0);
    const totalProfit = data.reduce((s, b) => s + Number(b.total_profit), 0);
    return { totalSales, totalProfit, billCount: data.length, bills: data };
  }
};
