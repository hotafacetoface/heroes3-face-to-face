// main.js — актуализированная версия (создание строк через DOM)
// API URL (оставлено как у тебя)
const API_URL = "https://script.google.com/macros/s/AKfycbxuqXY9GOsSwrL7qBkpUmhctyr4QNQzeKuz3XI9XZDsmePLCTJtWgH9XgrMOrtpXCxOKQ/exec";

// DOM elements (loader/debug)
const loader = document.getElementById('loader');
const loaderFill = document.getElementById('loader-fill');
const loaderText = document.getElementById('loader-text');
const debugInfo = document.getElementById('debug-info');
let debugLog = "";

function logDebug(msg) {
  debugLog += msg + '\n';
  if (debugInfo) debugInfo.textContent = debugLog;
  console.log(msg);
}

// helper to extract icon URL from various field formats
function resolveIconField(field) {
  if (!field) return '';
  if (typeof field === 'string') return field.trim();
  if (Array.isArray(field)) return field.length ? resolveIconField(field[0]) : '';
  if (typeof field === 'object') {
    if (field.url) return resolveIconField(field.url);
    if (field.src) return resolveIconField(field.src);
    if (field.href) return resolveIconField(field.href);
    if (field.value) return resolveIconField(field.value);
    for (const k in field) {
      if (typeof field[k] === 'string' && field[k].trim()) return field[k].trim();
    }
    return '';
  }
  return '';
}

// helper: create image element with optional class/title
function makeImg(src, cls = "", title = "") {
  const img = document.createElement('img');
  img.src = src;
  if (cls) img.className = cls;
  if (title) img.title = title;
  return img;
}

// create one table row for a hero (returns <tr>)
function createHeroRow(hero) {
  const tr = document.createElement('tr');

  // --- Замок ---
  const tdCastle = document.createElement('td');
  const castleName = hero["Родной замок"] || "";
  const castleIcon = (typeof castleIcons !== 'undefined' && castleIcons[castleName]) ? castleIcons[castleName] : "";
  if (castleIcon) {
    const wrap = document.createElement('div');
    wrap.className = 'castle-cell';
    const img = makeImg(castleIcon, 'castle-icon', castleName);
    const name = document.createElement('div');
    name.className = 'castle-name';
    name.textContent = castleName;
    wrap.appendChild(img);
    wrap.appendChild(name);
    tdCastle.appendChild(wrap);
  } else {
    tdCastle.textContent = castleName;
    tdCastle.style.textAlign = 'center';
    tdCastle.style.color = '#a08050';
  }
  tr.appendChild(tdCastle);

  // --- Герой (иконка + имя) ---
  const tdHero = document.createElement('td');
  const heroName = hero["Название героя"] || "";
  let heroIcon = resolveIconField(hero["Иконка"]) || ((typeof heroIcons !== 'undefined' && heroIcons[heroName]) ? heroIcons[heroName] : "");
  if (heroIcon) {
    const wrap = document.createElement('div');
    wrap.style.textAlign = 'center';
    const img = makeImg(heroIcon, 'hero-icon', heroName);
    wrap.appendChild(img);
    const name = document.createElement('div');
    name.className = 'hero-name';
    name.textContent = heroName;
    wrap.appendChild(name);
    tdHero.appendChild(wrap);
  } else {
    tdHero.textContent = heroName;
    tdHero.style.textAlign = 'center';
  }
  tr.appendChild(tdHero);

  // --- Специализация ---
  const tdSpec = document.createElement('td');
  const specName = hero["Специализация"] || "";
  const specIcon = (typeof specializationIcons !== 'undefined' && specializationIcons[specName]) ? specializationIcons[specName] : "";
  if (specIcon) {
    const wrap = document.createElement('div');
    wrap.className = 'spec-cell';
    const img = makeImg(specIcon, 'spec-icon', specName);
    const label = document.createElement('div');
    label.className = 'spec-name';
    label.textContent = specName;
    wrap.appendChild(img);
    wrap.appendChild(label);
    tdSpec.appendChild(wrap);
  } else {
    tdSpec.textContent = specName || "—";
    tdSpec.style.textAlign = 'center';
  }
  tr.appendChild(tdSpec);

  // --- Заклинания ---
  const tdSpells = document.createElement('td');
  tdSpells.className = 'spell';
  const spells = [];
  if (hero["Заклинание 1"] && hero["Заклинание 1"].toString().trim() !== "") spells.push(hero["Заклинание 1"].toString().trim());
  if (hero["Заклинание 2"] && hero["Заклинание 2"].toString().trim() !== "") spells.push(hero["Заклинание 2"].toString().trim());
  tdSpells.textContent = spells.length ? spells.join(', ') : "—";
  tdSpells.style.textAlign = 'center';
  tr.appendChild(tdSpells);

  // --- Навыки (вторичные) ---
  const tdSkills = document.createElement('td');
  tdSkills.className = 'skills-column';
  // Build icon containers (can be 0..2)
  for (let i = 1; i <= 2; i++) {
    const raw = hero[`Вторичный навык ${i}`] ? hero[`Вторичный навык ${i}`].toString().trim() : "";
    if (!raw) continue;
    const cleaned = raw.replace(/\(.*?\)/g, "").trim();
    const skillIcon = (typeof skillIcons !== 'undefined' && skillIcons[cleaned]) ? skillIcons[cleaned] : "";
    const wrap = document.createElement('div');
    wrap.className = 'icon-container';
    if (skillIcon) {
      const img = makeImg(skillIcon, 'icon-img', cleaned);
      wrap.appendChild(img);
    }
    const label = document.createElement('div');
    label.className = 'icon-label';
    label.textContent = cleaned;
    wrap.appendChild(label);
    tdSkills.appendChild(wrap);
  }
  if (!tdSkills.hasChildNodes()) tdSkills.textContent = "—";
  tr.appendChild(tdSkills);

  // --- Артефакт ---
  const tdArt = document.createElement('td');
  tdArt.className = 'art-column';
  tdArt.style.textAlign = 'center';
  tdArt.textContent = hero["Артефакт"] || "—";
  tr.appendChild(tdArt);

  // --- Первичные параметры (атака/защита/сила/знания) ---
  const tdParams = document.createElement('td');
  tdParams.className = 'parameters-column';
  tdParams.style.textAlign = 'center';
  // icons (use small images)
  const attackIcon = "https://static.wikia.nocookie.net/heroes-of-might-and-magic/images/d/de/Attack_small.png";
  const defenseIcon = "https://static.wikia.nocookie.net/heroes-of-might-and-magic/images/c/c1/Defense_small.png";
  const powerIcon = "https://static.wikia.nocookie.net/heroes-of-might-and-magic/images/8/89/Power_small.png";
  const knowledgeIcon = "https://static.wikia.nocookie.net/heroes-of-might-and-magic/images/7/7f/Knowledge_small.png";

	const primaryWrap = document.createElement('div');
	primaryWrap.className = 'primary-stats';
	primaryWrap.style.display = 'flex';
	primaryWrap.style.justifyContent = 'center';


const createStat = (val, icon) => {
    const wrap = document.createElement('div');
    wrap.className = 'param-cell';

    const img = makeImg(icon, 'param-icon', '');
    wrap.appendChild(img);

    const value = document.createElement('div');
    value.className = 'param-value';
    value.textContent = val || '0';
    wrap.appendChild(value);

    return wrap;
};


  primaryWrap.appendChild(createStat(hero["Атака"], attackIcon));
  primaryWrap.appendChild(createStat(hero["Защита"], defenseIcon));
  primaryWrap.appendChild(createStat(hero["Сила магии"], powerIcon));
  primaryWrap.appendChild(createStat(hero["Знания"], knowledgeIcon));

  tdParams.appendChild(primaryWrap);
  tr.appendChild(tdParams);

  return tr;
}

// Load and render heroes
async function loadHeroesData() {
  let progressInterval = null;
  try {
    if (loader) loader.style.display = 'flex';
    if (loaderFill) loaderFill.style.width = '0%';
    if (loaderText) loaderText.textContent = '0%';
    debugLog = "Начало загрузки...\n";

    // simulated progress
    let progress = 0;
    progressInterval = setInterval(() => {
      progress = Math.min(95, progress + Math.random() * 10);
      if (loaderFill) loaderFill.style.width = `${progress}%`;
      if (loaderText) loaderText.textContent = `${Math.floor(progress)}%`;
    }, 200);

    const response = await fetch(API_URL);
    logDebug(`Статус ответа: ${response.status}`);
    const data = await response.json();
    logDebug(`Получено записей: ${Array.isArray(data) ? data.length : 0}`);

    const tbody = document.querySelector("#heroes-table tbody");
    if (!tbody) throw new Error("tbody не найден");

    tbody.innerHTML = ""; // clear

    if (!Array.isArray(data) || data.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center">Данные не найдены</td></tr>`;
      if (progressInterval) clearInterval(progressInterval);
      if (loaderFill) loaderFill.style.width = '100%';
      if (loaderText) loaderText.textContent = '100%';
      setTimeout(()=> loader && (loader.style.display='none'), 500);
      return;
    }

    // append rows
    for (const hero of data) {
      logDebug(`Обработка героя: ${hero["Название героя"]}`);
      const row = createHeroRow(hero);
      tbody.appendChild(row);
    }

    // init DataTable (keeps your header controls logic)
	const table = new DataTable('#heroes-table', {
	  language: { url: "https://cdn.datatables.net/plug-ins/1.13.6/i18n/ru.json" },
	  pageLength: -1,
	  lengthChange: false,
	  order: [[1, "asc"]],
	  autoWidth: false,
	  initComplete: function() {
	  const headers = this.api().columns().header();
	  headers.each(function(header) {
		const headerCell = $(header);
		const headerContent = headerCell.text().trim();
		headerCell.empty();

		const columnHeader = $('<div class="column-header"></div>');
		const titleContainer = $('<div class="column-title"></div>').text(headerContent);

		columnHeader.append(titleContainer);
		headerCell.append(columnHeader);
	  });

	  if (progressInterval) clearInterval(progressInterval);
	  if (loaderFill) loaderFill.style.width = '100%';
	  if (loaderText) loaderText.textContent = '100%';
	  setTimeout(() => loader && (loader.style.display = 'none'), 500);
	  logDebug("Таблица инициализирована");
	}
    });

  } catch (err) {
    console.error("Ошибка:", err);
    const tbody = document.querySelector("#heroes-table tbody");
    if (tbody) tbody.innerHTML = `<tr><td colspan="7" style="text-align:center">Ошибка загрузки данных</td></tr>`;
    if (loaderFill) loaderFill.style.width = '0%';
    if (loaderText) loaderText.textContent = '0%';
    if (progressInterval) clearInterval(progressInterval);
  }
}

    // Функция для отображения/скрытия подменю
    // === Функция для отображения/скрытия подменю ===
function toggleDropdown(menuId, dropdownId) {
  const menu = document.getElementById(menuId);
  const dropdown = document.getElementById(dropdownId);

  // Закрываем все другие подменю
  document.querySelectorAll('.dropdown-menu').forEach(d => {
    if (d !== dropdown) d.classList.remove('show');
  });

  // Переключаем текущее подменю
  dropdown.classList.toggle('show');
}

// === Функция инициализации меню ===
function initMenu() {
  const statsMenu = document.getElementById('stats-menu');
  const authMenu = document.getElementById('auth-menu');
  if (!statsMenu || !authMenu) return;

  const authUser = localStorage.getItem("authUser");

  if (authUser) {
    authMenu.innerHTML = `
      <li class="has-dropdown">
        <a href="#" class="menu-item">${authUser}</a>
        <div class="dropdown-menu">
          <a href="my-stats.html">Моя статистика</a>
          <a href="my-history.html">История матчей</a>
          <a href="match-publish.html" class="dropdown-item">Опубликовать матч</a>
          <a href="#" id="logoutBtn">Выйти</a>
        </div>
      </li>
    `;
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", (e) => {
        e.preventDefault();
        localStorage.removeItem("authUser");
        window.location.reload();
      });
    }
  } else {
    authMenu.innerHTML = `
      <li><a href="register.html" class="menu-item">Регистрация</a></li>
      <li><a href="login.html" class="menu-item">Войти</a></li>
    `;
  }

  // Наведение и закрытие подменю
  const statsDropdown = document.getElementById('stats-dropdown');
  const databaseMenu = document.getElementById('database-menu');
  const databaseDropdown = document.getElementById('database-dropdown');

  statsMenu.addEventListener('mouseenter', () => statsDropdown.classList.add('show'));
  statsMenu.addEventListener('mouseleave', () => setTimeout(() => {
    if (!statsMenu.matches(':hover') && !statsDropdown.matches(':hover')) statsDropdown.classList.remove('show');
  }, 300));

  databaseMenu.addEventListener('mouseenter', () => databaseDropdown.classList.add('show'));
  databaseMenu.addEventListener('mouseleave', () => setTimeout(() => {
    if (!databaseMenu.matches(':hover') && !databaseDropdown.matches(':hover')) databaseDropdown.classList.remove('show');
  }, 300));

  document.addEventListener('click', (event) => {
    if (!statsMenu.contains(event.target) && !statsDropdown.contains(event.target)) {
      statsDropdown.classList.remove('show');
    }
    if (!databaseMenu.contains(event.target) && !databaseDropdown.contains(event.target)) {
      databaseDropdown.classList.remove('show');
    }
  });

  document.querySelectorAll('.menu-item').forEach(item => {
    item.addEventListener('click', function(e) {
      if (!this.id.includes('menu')) {
        document.querySelectorAll('.menu-item').forEach(i => i.classList.remove('active'));
        this.classList.add('active');
      }
      if ((this.id === 'stats-menu' || this.id === 'database-menu') && !this.matches(':hover')) {
        const dropdown = this.querySelector('.dropdown-menu');
        if (dropdown) dropdown.classList.remove('show');
      }
    });
  });
}

// === Автоинициализация при загрузке страницы ===
document.addEventListener('DOMContentLoaded', () => {
  const path = window.location.pathname;

  // Загружаем героев только на heroes.html
  if (path.includes('heroes.html') || document.getElementById('heroes-table')) {
    loadHeroesData();
  }

  // Инициализация меню для всех страниц
  initMenu();
});
// === История матчей пользователя ===
function initHistoryTable() {
  const loader = document.getElementById("loader");
  const loaderFill = document.getElementById("loader-fill");
  const loaderText = document.getElementById("loader-text");
  const tbody = document.querySelector("#history-table tbody");
  if (!tbody) return;

  if (loader) loader.style.display = "flex";
  let progress = 0;
  const progressInterval = setInterval(() => {
    progress = Math.min(progress + 15, 90);
    loaderFill.style.width = progress + "%";
    loaderText.textContent = Math.floor(progress) + "%";
  }, 150);

  // --- Фейковые данные (пример) ---
  const sampleData = Array.from({ length: 25 }).map((_, i) => ({
    date: `2025-10-${String(i + 1).padStart(2, "0")}`,
    player: "PlayerOne",
    castle: "Башня",
    hero: "Солмир",
    stack: "Титаны",
    bonus: "Артефакт",
    color: i % 2 === 0 ? "Синий" : "Красный",
    goldDiff: (Math.random() * 5000 - 2500).toFixed(0),
    enemyColor: i % 2 === 0 ? "Красный" : "Синий",
    enemyBonus: "Магия",
    enemyStack: "Черные драконы",
    enemyHero: "Гелу",
    enemyCastle: "Замок",
    result: i % 3 === 0 ? "Победа" : "Поражение"
  }));

  // --- Заполняем таблицу ---
const tr = document.createElement("tr");
tr.className = myOutcome === "Победа" ? "match-win" : "match-lose";

tr.innerHTML = `
  <td>${formattedDate}</td>
  <td>${myNick}</td>
  <td>${icon(castleIcon, myCastle)}</td>
  <td>${icon(heroIcon, myHero)}</td>
  <td>${icon(myStackIcon, myStack)}</td>
  <td>${myBonus}</td>
  <td>${myColor}</td>
  <td>${goldDiff}</td>
  <td>${enemyColor}</td>
  <td>${enemyBonus}</td>
  <td>${icon(enemyStackIcon, enemyStack)}</td>
  <td>${icon(enemyHeroIcon, enemyHero)}</td>
  <td>${icon(enemyCastleIcon, enemyCastle)}</td>
  <td>${enemyNick}</td>
  <td style="color:${myOutcome === "Победа" ? "#00ff80" : "#ff5555"}">${myOutcome}</td>
`;
tbody.appendChild(tr);

  // --- DataTables с пейджингом (10 на страницу) ---
  setTimeout(() => {
    new DataTable("#history-table", {
      pageLength: 10,
      language: { url: "https://cdn.datatables.net/plug-ins/1.13.6/i18n/ru.json" },
      lengthChange: false,
      ordering: true,
      autoWidth: false,
      order: [[0, "desc"]]
    });

    clearInterval(progressInterval);
    loaderFill.style.width = "100%";
    loaderText.textContent = "100%";
    setTimeout(() => loader.style.display = "none", 400);
  }, 800);
}
// === История матчей пользователя ===
async function initHistoryTable() {
  const authUser = localStorage.getItem("authUser");
  if (!authUser) {
    alert("Пожалуйста, войдите в систему, чтобы просматривать историю матчей.");
    window.location.href = "login.html";
    return;
  }

  const loader = document.getElementById("loader");
  const loaderFill = document.getElementById("loader-fill");
  const loaderText = document.getElementById("loader-text");
  const tbody = document.querySelector("#history-table tbody");
  if (!tbody) return;

  loader.style.display = "flex";
  loaderFill.style.width = "0%";
  loaderText.textContent = "0%";

  try {
    const response = await fetch(API_URL + "?sheet=Общая статистика");
    const data = await response.json();

    if (!Array.isArray(data)) throw new Error("Неверный формат данных от сервера");

    const userMatches = data.filter(row =>
      String(row["Ник игрока"]).trim().toLowerCase() === authUser.toLowerCase() ||
      String(row["Ник противника"]).trim().toLowerCase() === authUser.toLowerCase()
    );

    tbody.innerHTML = "";

    if (userMatches.length === 0) {
      tbody.innerHTML = `<tr><td colspan="15" style="text-align:center">Матчи не найдены</td></tr>`;
      loader.style.display = "none";
      return;
    }

    // Вспомогательная функция для иконки
    const icon = (src, name, size = 42) =>
      src ? `<img src="${src}" title="${name}" style="width:${size}px;height:${size}px;object-fit:contain;vertical-align:middle;margin-right:4px;"> ${name}` : name;

    const colorIcon = color => {
      if (color.toLowerCase().includes("крас")) return "🟥 Красный";
      if (color.toLowerCase().includes("син")) return "🟦 Синий";
      return color;
    };

    // === Перебор всех матчей ===
    for (const row of userMatches) {
      const nickPlayer = String(row["Ник игрока"]).trim();
      const nickEnemy = String(row["Ник противника"]).trim();
      const isPlayer = nickPlayer.toLowerCase() === authUser.toLowerCase();

      const myNick = authUser;
      const enemyNick = isPlayer ? nickEnemy : nickPlayer;

      const myCastle = isPlayer ? row["Замок"] : row["Замок противника"];
      const enemyCastle = isPlayer ? row["Замок противника"] : row["Замок"];
      const myHero = isPlayer ? row["Стартер"] : row["Стартер противника"];
      const enemyHero = isPlayer ? row["Стартер противника"] : row["Стартер"];
      const myStack = isPlayer ? row["Сильнейший стек игрока"] : row["Сильнейший стек противника"];
      const enemyStack = isPlayer ? row["Сильнейший стек противника"] : row["Сильнейший стек игрока"];
      const myBonus = isPlayer ? row["Начальный бонус игрока"] : row["Начальный бонус оппонента"];
      const enemyBonus = isPlayer ? row["Начальный бонус оппонента"] : row["Начальный бонус игрока"];

      let color = String(row["Цвет"] || "");
      let goldDiff = Number(row["Разница золота"] || 0);
      if (!isPlayer) {
        // инвертируем цвет и знак золота
        color = color.toLowerCase().includes("крас") ? "Синий" : "Красный";
        goldDiff = -goldDiff;
      }
      const myColor = colorIcon(color);
      const enemyColor = myColor.includes("Красный") ? "🟦 Синий" : "🟥 Красный";

      const outcomeRaw = String(row["Исход"] || "").trim().toLowerCase();
      const myOutcome = isPlayer
        ? (outcomeRaw === "победа" ? "Победа" : "Поражение")
        : (outcomeRaw === "победа" ? "Поражение" : "Победа");

      const dateRaw = String(row["Дата"] || "").trim();
      let formattedDate = dateRaw;
      const match = dateRaw.match(/(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})/);
      if (match) formattedDate = `${match[3]}.${match[2]}.${match[1]} ${match[4]}:${match[5]}`;

      // Иконки
      const castleIcon = (window.castleIcons && window.castleIcons[myCastle]) || "";
      const enemyCastleIcon = (window.castleIcons && window.castleIcons[enemyCastle]) || "";
      const heroIcon = (window.heroIcons && window.heroIcons[myHero]) || "";
      const enemyHeroIcon = (window.heroIcons && window.heroIcons[enemyHero]) || "";

      // Подбираем стек иконку
      const normalize = s => String(s || "").trim().toLowerCase();
      const myStackKey = normalize(myStack);
      const enemyStackKey = normalize(enemyStack);
      const myStackIcon = (window.monsterIcons && window.monsterIcons[myStackKey]?.icon) || "";
      const enemyStackIcon = (window.monsterIcons && window.monsterIcons[enemyStackKey]?.icon) || "";

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${formattedDate}</td>
        <td>${myNick}</td>
        <td>${icon(castleIcon, myCastle)}</td>
        <td>${icon(heroIcon, myHero)}</td>
        <td>${icon(myStackIcon, myStack)}</td>
        <td>${myBonus}</td>
        <td>${myColor}</td>
        <td>${goldDiff}</td>
        <td>${enemyColor}</td>
        <td>${enemyBonus}</td>
        <td>${icon(enemyStackIcon, enemyStack)}</td>
        <td>${icon(enemyHeroIcon, enemyHero)}</td>
        <td>${icon(enemyCastleIcon, enemyCastle)}</td>
        <td>${enemyNick}</td>
        <td style="color:${myOutcome === "Победа" ? "#00ff80" : "#ff5555"}">${myOutcome}</td>
      `;
      tbody.appendChild(tr);
    }

    new DataTable("#history-table", {
      pageLength: 10,
      language: { url: "https://cdn.datatables.net/plug-ins/1.13.6/i18n/ru.json" },
      lengthChange: false,
      ordering: true,
      autoWidth: false,
      order: [[0, "desc"]]
    });

    loaderFill.style.width = "100%";
    loaderText.textContent = "100%";
    setTimeout(() => loader.style.display = "none", 400);

  } catch (err) {
    console.error(err);
    tbody.innerHTML = `<tr><td colspan="15" style="text-align:center">Ошибка загрузки данных</td></tr>`;
    loader.style.display = "none";
  }
}
// === История матчей (версия без конфликта) ===
async function initMatchHistoryTable(apiUrl) {
  const authUser = localStorage.getItem("authUser");
  if (!authUser) {
    alert("Пожалуйста, войдите в систему, чтобы просмотреть историю матчей.");
    window.location.href = "login.html";
    return;
  }

  const loader = document.getElementById("loader");
  const loaderFill = document.getElementById("loader-fill");
  const loaderText = document.getElementById("loader-text");
  const tbody = document.querySelector("#history-table tbody");
  if (!tbody) return;

  loader.style.display = "flex";
  loaderFill.style.width = "0%";
  loaderText.textContent = "0%";

  try {
    const response = await fetch(`${apiUrl}?user=${encodeURIComponent(authUser)}`);
    const data = await response.json();

    tbody.innerHTML = "";
    if (!Array.isArray(data) || data.length === 0) {
      tbody.innerHTML = `<tr><td colspan="15" style="text-align:center">Матчи не найдены</td></tr>`;
      loader.style.display = "none";
      return;
    }

    const icon = (src, name, size = 42) =>
      src ? `<img src="${src}" title="${name}" style="width:${size}px;height:${size}px;vertical-align:middle;margin-right:4px;">${name}` : name;

    for (const row of data) {
      const castleIcon = (window.castleIcons && window.castleIcons[row.castle]) || "";
      const enemyCastleIcon = (window.castleIcons && window.castleIcons[row.enemyCastle]) || "";
      const heroIcon = (window.heroIcons && window.heroIcons[row.hero]) || "";
      const enemyHeroIcon = (window.heroIcons && window.heroIcons[row.enemyHero]) || "";
      const myStackIcon = (window.monsterIcons && window.monsterIcons[row.stack?.toLowerCase()]?.icon) || "";
      const enemyStackIcon = (window.monsterIcons && window.monsterIcons[row.enemyStack?.toLowerCase()]?.icon) || "";

      const tr = document.createElement("tr");
      tr.className = row.outcome === "Победа" ? "match-win" : "match-lose";
      tr.innerHTML = `
        <td>${row.date}</td>
        <td>${row.player}</td>
        <td>${icon(castleIcon, row.castle)}</td>
        <td>${icon(heroIcon, row.hero)}</td>
        <td>${icon(myStackIcon, row.stack)}</td>
        <td>${row.bonus}</td>
        <td>${row.color}</td>
        <td>${row.goldDiff}</td>
        <td>${row.enemyColor}</td>
        <td>${row.enemyBonus}</td>
        <td>${icon(enemyStackIcon, row.enemyStack)}</td>
        <td>${icon(enemyHeroIcon, row.enemyHero)}</td>
        <td>${icon(enemyCastleIcon, row.enemyCastle)}</td>
        <td>${row.enemyNick}</td>
        <td style="color:${row.outcome === "Победа" ? "#00ff80" : "#ff5555"}">${row.outcome}</td>
      `;
      tbody.appendChild(tr);
    }

    new DataTable("#history-table", {
      pageLength: 10,
      language: { url: "https://cdn.datatables.net/plug-ins/1.13.6/i18n/ru.json" },
      lengthChange: false,
      order: [[0, "desc"]],
      autoWidth: false
    });

    loaderFill.style.width = "100%";
    loaderText.textContent = "100%";
    setTimeout(() => loader.style.display = "none", 400);

  } catch (err) {
    console.error("Ошибка истории:", err);
    tbody.innerHTML = `<tr><td colspan="15" style="text-align:center">Ошибка загрузки</td></tr>`;
    loader.style.display = "none";
  }
}
