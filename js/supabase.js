// ============================================================
// supabase.js - Final Working Version
// ============================================================

const SUPABASE_URL = 'https://gtujlykdrfwqbdschsya.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_ypgOpoGy5hn1CVAGfFPvkw_SuWj4k1c';

let db = null;

function initDB() {
  if (db) return db;
  try {
    db = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('✅ Supabase connected!');
    return db;
  } catch(e) {
    console.error('❌ Supabase init failed:', e);
    throw e;
  }
}

// ── Auth ──
const Auth = {
  getDB() { return initDB(); },

  async signIn(email, password) {
    const { data, error } = await this.getDB().auth
      .signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },

  async signOut() {
    await this.getDB().auth.signOut();
    window.location.href = '/index.html';
  },

  async getUser() {
    const { data: { user } } = await this.getDB().auth.getUser();
    return user;
  },

  async getSession() {
    const { data: { session } } = await this.getDB().auth.getSession();
    return session;
  },

  async updatePassword(newPassword) {
    const { error } = await this.getDB().auth.updateUser({ 
      password: newPassword 
    });
    if (error) throw error;
  },

  async resetPassword(email) {
    const { error } = await this.getDB().auth
      .resetPasswordForEmail(email);
    if (error) throw error;
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

// ── Menu ──
const Menu = {
  getDB() { return initDB(); },

  async getAll() {
    console.log('Loading menu items...');
    const { data, error } = await this.getDB()
      .from('menu_items')
      .select('*')
      .order('category')
      .order('name');
    if (error) {
      console.error('Menu error:', error);
      throw error;
    }
    console.log('Menu loaded:', data?.length, 'items');
    return data || [];
  },

  async getAvailable() {
    const { data, error } = await this.getDB()
      .from('menu_items')
      .select('*')
      .eq('available', true)
      .order('category')
      .order('name');
    if (error) {
      console.error('Menu available error:', error);
      throw error;
    }
    return data || [];
  },

  async create(item) {
    const { data, error } = await this.getDB()
      .from('menu_items')
      .insert(item)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id, updates) {
    const { data, error } = await this.getDB()
      .from('menu_items')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { error } = await this.getDB()
      .from('menu_items')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }
};

// ── Bills ──
const Bills = {
  getDB() { return initDB(); },

  async generateBillNumber() {
    const today = new Date().toISOString().slice(0, 10);
    const dateStr = today.replace(/-/g, '');
    const { count } = await this.getDB()
      .from('bills')
      .select('*', { count: 'exact', head: true })
      .eq('bill_date', today);
    const seq = String((count || 0) + 1).padStart(3, '0');
    return `DH${dateStr}${seq}`;
  },

  async create(billData, items) {
    const user = await Auth.getUser();
    const billNumber = await this.generateBillNumber();
    const total = items.reduce((s, i) => s + i.line_total, 0);
    const now = new Date();

    const { data: bill, error: billErr } = await this.getDB()
      .from('bills')
      .insert({
        bill_number: billNumber,
        bill_date: now.toISOString().slice(0, 10),
        bill_time: now.toTimeString().slice(0, 8),
        subtotal: total,
        total: total,
        created_by: user.id
      })
      .select()
      .single();

    if (billErr) {
      console.error('Bill error:', billErr);
      throw billErr;
    }

    const billItems = items.map(i => ({
      bill_id: bill.id,
      item_id: i.item_id || null,
      item_name: i.item_name,
      quantity: i.quantity,
      selling_price: i.selling_price,
      line_total: i.line_total,
    }));

    const { error: itemsErr } = await this.getDB()
      .from('bill_items')
      .insert(billItems);
    if (itemsErr) {
      console.error('Items error:', itemsErr);
      throw itemsErr;
    }

    return bill;
  },

  async getAll() {
    const { data, error } = await this.getDB()
      .from('bills')
      .select('*, bill_items(*)')
      .order('bill_date', { ascending: false });
    if (error) {
      console.error('Bills getAll error:', error);
      throw error;
    }
    return data || [];
  },

  async getByDateRange(from, to) {
    const { data, error } = await this.getDB()
      .from('bills')
      .select('*, bill_items(*)')
      .gte('bill_date', from)
      .lte('bill_date', to)
      .order('bill_date', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async getById(id) {
    const { data, error } = await this.getDB()
      .from('bills')
      .select('*, bill_items(*)')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async search(query) {
    const { data, error } = await this.getDB()
      .from('bills')
      .select('*, bill_items(*)')
      .ilike('bill_number', `%${query}%`)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async delete(id) {
    const { error } = await this.getDB()
      .from('bills')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }
};

// ── Settings ──
const Settings = {
  getDB() { return initDB(); },

  async get(key) {
    const { data, error } = await this.getDB()
      .from('settings')
      .select('value')
      .eq('key', key)
      .single();
    if (error) return null;
    return data?.value;
  },

  async getAll() {
    const { data, error } = await this.getDB()
      .from('settings')
      .select('*');
    if (error) throw error;
    return data || [];
  },

  async set(key, value) {
    const { error } = await this.getDB()
      .from('settings')
      .update({ value })
      .eq('key', key);
    if (error) throw error;
  }
};

// ── Reports ──
const Reports = {
  getDB() { return initDB(); },

  async getSummary(from, to) {
    const { data, error } = await this.getDB()
      .from('bills')
      .select('total, bill_date')
      .gte('bill_date', from)
      .lte('bill_date', to);
    if (error) throw error;
    const bills = data || [];
    const totalSales = bills.reduce((s, b) => s + Number(b.total), 0);
    return {
      totalSales,
      totalProfit: 0,
      billCount: bills.length,
      bills
    };
  }
};
