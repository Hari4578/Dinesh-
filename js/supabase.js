// ============================================================
// js/supabase.js
// ============================================================

const SUPABASE_URL      = 'https://gtujlykdrfwqbdschsya.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0dWpseWtkcmZ3cWJkc2Noc3lhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQzMTc4MjMsImV4cCI6MjA4OTg5MzgyM30.Mahmwd7TwW9A20B3ksDqCBfOS5E4lqcBiZ2wRLQRlJk';

const { createClient } = window.supabase;
const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ── AUTH ──────────────────────────────────────────────────────
const Auth = {
  async login(email, password) {
    const { data, error } = await db.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },
  async logout() {
    await db.auth.signOut();
    window.location.href = '/index.html';
  },
  async getUser() {
    const { data: { user } } = await db.auth.getUser();
    return user;
  },
  async getSession() {
    const { data: { session } } = await db.auth.getSession();
    return session;
  },
  async requireAuth() {
    const session = await this.getSession();
    if (!session) {
      window.location.href = '/index.html';
      return null;
    }
    return session.user;
  }
};

// ── MENU ──────────────────────────────────────────────────────
const Menu = {
  async getAll() {
    const { data, error } = await db
      .from('menu_items')
      .select('*')
      .order('category')
      .order('name');
    if (error) throw error;
    return data;
  },
  async getAvailable() {
    const { data, error } = await db
      .from('menu_items')
      .select('*')
      .eq('available', true)
      .order('category')
      .order('name');
    if (error) throw error;
    return data;
  },
  async create(item) {
    const { data, error } = await db
      .from('menu_items')
      .insert([item])
      .select()
      .single();
    if (error) throw error;
    return data;
  },
  async update(id, updates) {
    const { data, error } = await db
      .from('menu_items')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
  async delete(id) {
    const { error } = await db.from('menu_items').delete().eq('id', id);
    if (error) throw error;
  }
};

// ── BILLS ─────────────────────────────────────────────────────
const Bills = {
  async generateBillNumber() {
    const today = new Date();
    const prefix = 'DH' +
      today.getFullYear() +
      String(today.getMonth() + 1).padStart(2, '0') +
      String(today.getDate()).padStart(2, '0');
    const { data } = await db
      .from('bills')
      .select('bill_number')
      .like('bill_number', prefix + '%')
      .order('bill_number', { ascending: false })
      .limit(1);
    const next = data && data.length > 0
      ? parseInt(data[0].bill_number.slice(-3)) + 1
      : 1;
    return prefix + String(next).padStart(3, '0');
  },
  async create(billData, items) {
    const user = await Auth.getUser();
    const subtotal = items.reduce((s, i) => s + Number(i.line_total), 0);
    const { data: bill, error } = await db
      .from('bills')
      .insert([{
        bill_number: billData.bill_number,
        bill_date:   new Date().toISOString().slice(0, 10),
        bill_time:   new Date().toTimeString().slice(0, 8),
        subtotal,
        total:       subtotal,
        created_by:  user?.id
      }])
      .select()
      .single();
    if (error) throw error;
    const billItems = items.map(item => ({
      bill_id:       bill.id,
      item_id:       item.item_id,
      item_name:     item.item_name,
      quantity:      item.quantity,
      selling_price: item.selling_price,
      line_total:    item.line_total
    }));
    const { error: itemsError } = await db.from('bill_items').insert(billItems);
    if (itemsError) throw itemsError;
    return bill;
  },
  async getAll() {
    const { data, error } = await db
      .from('bills')
      .select('*, bill_items(*)')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },
  async getByDateRange(from, to) {
    const { data, error } = await db
      .from('bills')
      .select('*, bill_items(*)')
      .gte('bill_date', from)
      .lte('bill_date', to)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },
  async delete(id) {
    const { error } = await db.from('bills').delete().eq('id', id);
    if (error) throw error;
  }
};

// ── SETTINGS ──────────────────────────────────────────────────
const Settings = {
  async get(key) {
    const { data, error } = await db
      .from('settings')
      .select('value')
      .eq('key', key)
      .single();
    if (error) return null;
    return data?.value;
  },
  async set(key, value) {
    const { error } = await db
      .from('settings')
      .upsert({ key, value }, { onConflict: 'key' });
    if (error) throw error;
  }
};
