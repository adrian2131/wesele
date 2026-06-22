(function () {
  const config = window.WEDDING_CONFIG || {};
  const storageKey = 'wedding-schedule';
  const defaults = {
    timeline: {
      'sat-ceremony': '14:00',
      'sat-thanks': '15:00',
      'sat-reception': '16:30',
      'sat-first-dance': '17:30',
      'sat-animator': '17:30',
      'sat-cake': '22:00',
      'sat-midnight': '24:00',
      'sat-end': '04:00',
      'sun-snacks': '08:00',
      'sun-reception': '12:00',
      'sun-end': '17:00'
    },
    customItems: [],
    transport: [
      { name: 'Bus', time: '01:00' },
      { name: 'Bus', time: '03:00' },
      { name: 'Bus', time: '04:00' }
    ],
    updatedAt: null
  };

  function isConfigured() {
    return Boolean(config.supabaseUrl && config.supabaseAnonKey);
  }

  function normalize(data) {
    const legacyBuses = Array.isArray(data?.buses) ? data.buses : [];
    const hasTransportData = Array.isArray(data?.transport) || Array.isArray(data?.buses);
    const transportSource = Array.isArray(data?.transport) ? data.transport : legacyBuses;
    const transport = transportSource.map((item) => typeof item === 'string'
      ? { name: 'Bus', time: item }
      : { name: item?.name || 'Bus', time: item?.time || '' }
    ).filter((item) => item.time);

    return {
      timeline: { ...defaults.timeline, ...(data?.timeline || {}) },
      customItems: Array.isArray(data?.customItems) ? data.customItems.map((item) => ({
        day: item?.day === 'sunday' ? 'sunday' : 'saturday',
        name: item?.name || '',
        time: item?.time || ''
      })).filter((item) => item.name && item.time).sort((a, b) =>
        a.day.localeCompare(b.day) || sortMinutes(a.time, a.day) - sortMinutes(b.time, b.day)
      ) : [],
      transport: (hasTransportData ? transport : defaults.transport)
        .sort((a, b) => sortMinutes(a.time) - sortMinutes(b.time)),
      updatedAt: data?.updatedAt || null
    };
  }

  function localData() {
    try {
      return normalize(JSON.parse(localStorage.getItem(storageKey)));
    } catch {
      return normalize(defaults);
    }
  }

  async function load() {
    if (!isConfigured()) return localData();

    const response = await fetch(`${config.supabaseUrl}/rest/v1/wedding_schedule?id=eq.main&select=data`, {
      cache: 'no-store',
      headers: {
        apikey: config.supabaseAnonKey,
        Authorization: `Bearer ${config.supabaseAnonKey}`
      }
    });
    if (!response.ok) throw new Error('Nie udało się pobrać harmonogramu.');
    const rows = await response.json();
    return normalize(rows[0]?.data || defaults);
  }

  async function login(email, password) {
    if (!isConfigured()) return { access_token: 'local' };

    const response = await fetch(`${config.supabaseUrl}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: {
        apikey: config.supabaseAnonKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });
    if (!response.ok) throw new Error('Nieprawidłowy e-mail lub hasło.');
    return response.json();
  }

  async function save(data, accessToken) {
    const normalized = normalize({ ...data, updatedAt: new Date().toISOString() });
    if (!isConfigured()) {
      localStorage.setItem(storageKey, JSON.stringify(normalized));
      return normalized;
    }
    if (!accessToken) throw new Error('Zaloguj się ponownie.');

    const response = await fetch(`${config.supabaseUrl}/rest/v1/wedding_schedule?id=eq.main`, {
      method: 'PATCH',
      headers: {
        apikey: config.supabaseAnonKey,
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal'
      },
      body: JSON.stringify({ data: normalized })
    });
    if (!response.ok) throw new Error('Nie udało się zapisać zmian.');
    return normalized;
  }

  function render(data) {
    const normalized = normalize(data);
    document.querySelectorAll('[data-schedule-key]').forEach((element) => {
      const value = normalized.timeline[element.dataset.scheduleKey];
      if (value) element.textContent = value;
    });

    ['saturday', 'sunday'].forEach((day) => {
      const list = document.getElementById(`${day}-items`);
      if (!list) return;
      list.querySelectorAll('[data-custom-item]').forEach((element) => element.remove());
      normalized.customItems.filter((item) => item.day === day).forEach((item) => {
        list.insertAdjacentHTML('beforeend', `
        <div class="pt-item" data-custom-item>
          <span class="pt-idx"></span>
          <div class="pt-body">
            <span class="pt-name">${escapeHtml(item.name)}</span>
          </div>
          <span class="pt-time">${escapeHtml(item.time)}</span>
        </div>
        `);
      });

      [...list.children].sort((a, b) => {
        const aTime = a.querySelector('.pt-time')?.textContent || '';
        const bTime = b.querySelector('.pt-time')?.textContent || '';
        return sortMinutes(aTime, day) - sortMinutes(bTime, day);
      }).forEach((item, index) => {
        const number = item.querySelector('.pt-idx');
        if (number) number.textContent = String(index + 1).padStart(2, '0');
        list.append(item);
      });
    });

    const busList = document.getElementById('bus-times');
    if (busList) {
      busList.innerHTML = normalized.transport.map((item) => `
        <div class="bus-time">
          <span class="bus-time-label">${escapeHtml(item.name)}</span>
          <strong>${escapeHtml(item.time)}</strong>
        </div>
      `).join('');
    }
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (character) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    }[character]));
  }

  function sortMinutes(time, day = '') {
    const [hours = 0, minutes = 0] = String(time).split(':').map(Number);
    const value = hours * 60 + minutes;
    return day === 'saturday' && hours < 10 ? value + 1440 : value;
  }

  async function initializePublicPage() {
    try {
      render(await load());
    } catch (error) {
      console.error(error);
      render(defaults);
    }

    if (isConfigured()) {
      setInterval(async () => {
        try {
          render(await load());
        } catch (error) {
          console.error(error);
        }
      }, 60000);
    }
  }

  window.WeddingSchedule = { defaults, isConfigured, load, login, save, render };
  document.addEventListener('DOMContentLoaded', initializePublicPage);
})();
