// ═══════════════════════════════════════════════════════════════
// Petrol Scout — Price Monitor | Main Application
// ═══════════════════════════════════════════════════════════════

(() => {
  'use strict';

  // ── Supabase Client ──────────────────────────────────────────
  const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  // ── State ────────────────────────────────────────────────────
  let notifCount = 0;
  let notifPermission = Notification.permission;

  // ── DOM refs ─────────────────────────────────────────────────
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  const dom = {
    statusBadge: $('#status-badge'),
    statusText: $('#status-text'),
    monitorToggle: $('#monitor-toggle'),
    lastFetch: $('#last-fetch'),
    statStations: $('#stat-stations'),
    statChangesToday: $('#stat-changes-today'),
    statTotalRuns: $('#stat-total-runs'),
    statUptime: $('#stat-uptime'),
    changesFeed: $('#changes-feed'),
    changesCount: $('#changes-count'),
    fetchHistory: $('#fetch-history'),
    stationsTbody: $('#stations-tbody'),
    stationCount: $('#station-count'),
    allChangesList: $('#all-changes-list'),
    notifBell: $('#notif-bell'),
    notifCount: $('#notif-count'),
    btnRefresh: $('#btn-manual-refresh'),
    btnSaveTelegram: $('#btn-save-telegram'),
    btnTestTelegram: $('#btn-test-telegram'),
    telegramToken: $('#telegram-token'),
    telegramChat: $('#telegram-chat'),
    telegramStatus: $('#telegram-status'),
    toastContainer: $('#toast-container'),
  };

  // ── Helpers ──────────────────────────────────────────────────
  function formatTime(ts) {
    if (!ts) return '—';
    const d = new Date(ts);
    return d.toLocaleString('es-MX', {
      month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      hour12: false
    });
  }

  function relativeTime(ts) {
    if (!ts) return '—';
    const diff = Date.now() - new Date(ts).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  }

  function formatPrice(p) {
    if (p === null || p === undefined) return '—';
    return `$${Number(p).toFixed(2)}`;
  }

  function getFuelLabel(subProduct) {
    if (!subProduct) return 'Desconocido';
    const lower = subProduct.toLowerCase();
    if (lower.includes('regular')) return 'Regular';
    if (lower.includes('premium')) return 'Premium';
    if (lower.includes('diésel') || lower.includes('diesel')) return 'Diésel';
    return subProduct;
  }

  function getFuelClass(subProduct) {
    if (!subProduct) return 'unknown';
    const lower = subProduct.toLowerCase();
    if (lower.includes('regular')) return 'regular';
    if (lower.includes('premium')) return 'premium';
    if (lower.includes('diésel') || lower.includes('diesel')) return 'diesel';
    return 'unknown';
  }

  function showToast(title, message, icon = '⛽') {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <div class="toast-icon">${icon}</div>
      <div class="toast-body">
        <div class="toast-title">${title}</div>
        <div class="toast-message">${message}</div>
      </div>
    `;
    dom.toastContainer.appendChild(toast);
    setTimeout(() => toast.remove(), 5000);
  }

  function sendBrowserNotification(title, body) {
    if (notifPermission === 'granted') {
      try {
        new Notification(title, { body, icon: '⛽', tag: 'petrol-scout' });
      } catch (e) { /* mobile fallback */ }
    }
  }

  // ── Tab Navigation ───────────────────────────────────────────
  $$('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('.tab-btn').forEach(b => b.classList.remove('active'));
      $$('.tab-content').forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      $(`#tab-${btn.dataset.tab}`).classList.add('active');

      // Lazy-load data for tabs
      if (btn.dataset.tab === 'stations') loadStations();
      if (btn.dataset.tab === 'history') loadAllChanges();
    });
  });

  // ── Load Config ──────────────────────────────────────────────
  async function loadConfig() {
    const { data, error } = await sb.from('monitor_config').select('*').eq('id', 1).single();
    if (error) return console.error('Config load error:', error);

    dom.monitorToggle.checked = data.is_active;
    updateStatusBadge(data.is_active);

    if (data.telegram_bot_token) dom.telegramToken.value = data.telegram_bot_token;
    if (data.telegram_chat_id) dom.telegramChat.value = data.telegram_chat_id;
  }

  function updateStatusBadge(active) {
    dom.statusBadge.className = `status-badge ${active ? 'active' : 'paused'}`;
    dom.statusText.textContent = active ? 'Active' : 'Paused';
  }

  // ── Monitor Toggle ──────────────────────────────────────────
  dom.monitorToggle.addEventListener('change', async () => {
    const isActive = dom.monitorToggle.checked;
    updateStatusBadge(isActive);

    const { error } = await sb
      .from('monitor_config')
      .update({ is_active: isActive, updated_at: new Date().toISOString() })
      .eq('id', 1);

    if (error) {
      showToast('Error', 'Failed to update monitoring status', '❌');
      dom.monitorToggle.checked = !isActive;
      updateStatusBadge(!isActive);
    } else {
      showToast(
        isActive ? 'Monitoring Resumed' : 'Monitoring Paused',
        isActive ? 'Price fetching is now active' : 'Price fetching has been paused',
        isActive ? '▶️' : '⏸️'
      );
    }
  });

  // ── Load Stats ───────────────────────────────────────────────
  async function loadStats() {
    // Total unique stations (not total rows — each station has multiple fuel types)
    const { data: stationData } = await sb
      .from('station_prices')
      .select('station_number');
    if (stationData) {
      const uniqueStations = new Set(stationData.map(s => s.station_number));
      dom.statStations.textContent = uniqueStations.size;
    } else {
      dom.statStations.textContent = '—';
    }

    // Changes today
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const { count: changesToday } = await sb
      .from('price_changes')
      .select('*', { count: 'exact', head: true })
      .gte('detected_at', todayStart.toISOString());
    dom.statChangesToday.textContent = changesToday ?? 0;

    // Total fetch runs
    const { count: totalRuns } = await sb
      .from('fetch_runs')
      .select('*', { count: 'exact', head: true });
    dom.statTotalRuns.textContent = totalRuns ?? 0;

    // Uptime (first fetch run)
    const { data: firstRun } = await sb
      .from('fetch_runs')
      .select('started_at')
      .order('started_at', { ascending: true })
      .limit(1);
    if (firstRun && firstRun.length > 0) {
      dom.statUptime.textContent = relativeTime(firstRun[0].started_at);
      dom.statUptime.title = formatTime(firstRun[0].started_at);
    }

    // Last fetch
    const { data: lastRun } = await sb
      .from('fetch_runs')
      .select('*')
      .order('started_at', { ascending: false })
      .limit(1);
    if (lastRun && lastRun.length > 0) {
      dom.lastFetch.innerHTML = `Last fetch: <strong>${relativeTime(lastRun[0].started_at)}</strong>`;
    }
  }

  // ── Load Changes Feed ────────────────────────────────────────
  async function loadChanges() {
    const { data, error } = await sb
      .from('price_changes')
      .select('*')
      .order('detected_at', { ascending: false })
      .limit(50);

    if (error) return console.error('Changes load error:', error);

    dom.changesCount.textContent = data.length;

    if (data.length === 0) {
      dom.changesFeed.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">📡</div>
          <div class="empty-state-text">Waiting for price changes...</div>
          <div class="empty-state-sub">Changes will appear here in real-time</div>
        </div>`;
      return;
    }

    dom.changesFeed.innerHTML = data.map(c => renderChangeItem(c)).join('');
  }

  function renderChangeItem(c) {
    const isUp = Number(c.price_diff) > 0;
    const diffSign = isUp ? '+' : '';
    const fuelLabel = getFuelLabel(c.sub_product || c.product);
    const fuelClass = getFuelClass(c.sub_product || c.product);
    return `
      <div class="change-item">
        <div class="change-icon ${isUp ? 'up' : 'down'}">${isUp ? '📈' : '📉'}</div>
        <div class="change-content">
          <div class="change-station" title="${c.station_name}">${c.station_name}</div>
          <div class="change-product">
            <span class="fuel-badge ${fuelClass}">${fuelLabel}</span>
            <span>${c.station_number}</span>
          </div>
          <div class="change-prices">
            <span class="change-old">${formatPrice(c.old_price)}</span>
            <span class="change-arrow">→</span>
            <span class="change-new ${isUp ? 'up' : 'down'}">${formatPrice(c.new_price)}</span>
            ${c.price_diff !== null ? `<span class="change-diff ${isUp ? 'up' : 'down'}">${diffSign}${Number(c.price_diff).toFixed(2)}</span>` : ''}
          </div>
        </div>
        <div class="change-time">${relativeTime(c.detected_at)}</div>
      </div>`;
  }

  // ── Load Fetch History ───────────────────────────────────────
  async function loadFetchHistory() {
    const { data, error } = await sb
      .from('fetch_runs')
      .select('*')
      .order('started_at', { ascending: false })
      .limit(20);

    if (error) return console.error('History load error:', error);

    if (!data || data.length === 0) {
      dom.fetchHistory.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">⏳</div>
          <div class="empty-state-text">No fetch runs yet</div>
          <div class="empty-state-sub">First fetch will happen within 30 minutes</div>
        </div>`;
      return;
    }

    dom.fetchHistory.innerHTML = data.map(r => `
      <div class="history-item">
        <div class="history-status ${r.status}"></div>
        <div class="history-info">
          <div class="history-time">${formatTime(r.started_at)}</div>
          <div class="history-meta">
            <span>📡 ${r.stations_found ?? 0} stations</span>
            <span>📊 ${r.changes_detected ?? 0} changes</span>
            <span>${r.status}</span>
          </div>
        </div>
      </div>`
    ).join('');
  }

  // ── Load Stations ────────────────────────────────────────────
  async function loadStations() {
    const { data, error } = await sb
      .from('station_prices')
      .select('*')
      .order('station_name', { ascending: true });

    if (error) return console.error('Stations load error:', error);

    if (!data || data.length === 0) {
      dom.stationCount.textContent = 0;
      dom.stationsTbody.innerHTML = `
        <tr><td colspan="5">
          <div class="empty-state">
            <div class="empty-state-icon">🏪</div>
            <div class="empty-state-text">No stations loaded yet</div>
          </div>
        </td></tr>`;
      return;
    }

    // Show unique station count, not total rows
    const uniqueStationSet = new Set(data.map(s => s.station_number));
    dom.stationCount.textContent = uniqueStationSet.size;

    dom.stationsTbody.innerHTML = data.map(s => `
      <tr>
        <td class="station-name" title="${s.station_name}">${s.station_name}</td>
        <td>${s.station_number}</td>
        <td><span class="fuel-badge ${getFuelClass(s.sub_product)}">${getFuelLabel(s.sub_product)}</span></td>
        <td class="price">${formatPrice(s.current_price)}</td>
        <td>${relativeTime(s.last_updated)}</td>
      </tr>`
    ).join('');
  }

  // ── Load All Changes (History tab) ───────────────────────────
  async function loadAllChanges() {
    const { data, error } = await sb
      .from('price_changes')
      .select('*')
      .order('detected_at', { ascending: false })
      .limit(200);

    if (error) return console.error('All changes error:', error);

    if (!data || data.length === 0) {
      dom.allChangesList.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">📋</div>
          <div class="empty-state-text">No changes recorded yet</div>
        </div>`;
      return;
    }

    dom.allChangesList.innerHTML = data.map(c => renderChangeItem(c)).join('');
  }

  // ── Realtime Subscription ────────────────────────────────────
  function setupRealtime() {
    // Subscribe to price_changes for live feed
    sb.channel('price-changes-realtime')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'price_changes'
      }, (payload) => {
        const c = payload.new;
        const isUp = Number(c.price_diff) > 0;

        // Prepend to feed
        const emptyState = dom.changesFeed.querySelector('.empty-state');
        if (emptyState) emptyState.remove();

        dom.changesFeed.insertAdjacentHTML('afterbegin', renderChangeItem(c));
        dom.changesCount.textContent = Number(dom.changesCount.textContent) + 1;

        // Update stats
        dom.statChangesToday.textContent = Number(dom.statChangesToday.textContent) + 1;

        // Increment notification count
        notifCount++;
        dom.notifCount.textContent = notifCount;
        dom.notifCount.style.display = 'flex';

        // Toast notification
        showToast(
          'Price Change Detected',
          `${c.station_name} — ${getFuelLabel(c.sub_product || c.product)}: ${formatPrice(c.old_price)} → ${formatPrice(c.new_price)}`,
          isUp ? '📈' : '📉'
        );

        // Browser notification
        sendBrowserNotification(
          `⛽ ${getFuelLabel(c.sub_product || c.product)} ${isUp ? '↑' : '↓'}`,
          `${c.station_name}: ${formatPrice(c.old_price)} → ${formatPrice(c.new_price)}`
        );
      })
      .subscribe();

    // Subscribe to fetch_runs for status updates
    sb.channel('fetch-runs-realtime')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'fetch_runs'
      }, (payload) => {
        loadFetchHistory();
        loadStats();
      })
      .subscribe();
  }

  // ── Telegram Config ──────────────────────────────────────────
  dom.btnSaveTelegram.addEventListener('click', async () => {
    const token = dom.telegramToken.value.trim();
    const chatId = dom.telegramChat.value.trim();

    const { error } = await sb
      .from('monitor_config')
      .update({
        telegram_bot_token: token || null,
        telegram_chat_id: chatId || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', 1);

    if (error) {
      dom.telegramStatus.innerHTML = '<span style="color:var(--accent-rose)">❌ Failed to save</span>';
    } else {
      dom.telegramStatus.innerHTML = '<span style="color:var(--accent-emerald)">✅ Saved successfully</span>';
      setTimeout(() => dom.telegramStatus.innerHTML = '', 3000);
    }
  });

  dom.btnTestTelegram.addEventListener('click', async () => {
    const token = dom.telegramToken.value.trim();
    const chatId = dom.telegramChat.value.trim();

    if (!token || !chatId) {
      dom.telegramStatus.innerHTML = '<span style="color:var(--accent-amber)">⚠️ Enter both token and chat ID</span>';
      return;
    }

    dom.telegramStatus.innerHTML = '<span style="color:var(--text-muted)">🔄 Sending test message...</span>';

    try {
      const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: '✅ *Petrol Scout Monitor* is connected!\n\nYou will receive price change alerts here.',
          parse_mode: 'Markdown'
        })
      });

      const data = await res.json();
      if (data.ok) {
        dom.telegramStatus.innerHTML = '<span style="color:var(--accent-emerald)">✅ Test message sent! Check Telegram.</span>';
      } else {
        dom.telegramStatus.innerHTML = `<span style="color:var(--accent-rose)">❌ ${data.description}</span>`;
      }
    } catch (e) {
      dom.telegramStatus.innerHTML = `<span style="color:var(--accent-rose)">❌ Network error</span>`;
    }
  });

  // ── Refresh Button ───────────────────────────────────────────
  dom.btnRefresh.addEventListener('click', () => {
    loadStats();
    loadChanges();
    loadFetchHistory();
    showToast('Refreshed', 'Data reloaded from database', '🔄');
  });

  // ── Notification Bell ────────────────────────────────────────
  dom.notifBell.addEventListener('click', () => {
    if (notifPermission === 'default') {
      Notification.requestPermission().then(perm => {
        notifPermission = perm;
        if (perm === 'granted') {
          showToast('Notifications Enabled', 'You\'ll get desktop alerts for price changes', '🔔');
        }
      });
    }
    notifCount = 0;
    dom.notifCount.style.display = 'none';
  });

  // ── Auto-refresh relative times ─────────────────────────────
  setInterval(() => {
    loadStats();
  }, 60000); // refresh stats every minute

  // ── Initialize ───────────────────────────────────────────────
  async function init() {
    await loadConfig();
    await loadStats();
    await loadChanges();
    await loadFetchHistory();
    setupRealtime();

    // Request notification permission
    if ('Notification' in window && notifPermission === 'default') {
      // Don't prompt immediately — wait for user interaction
    }
  }

  init();
})();
