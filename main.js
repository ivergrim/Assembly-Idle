// Assembly Idle main logic. All gameplay systems live here.

const GAME_VERSION = 1;
const SAVE_KEY = "assemblyIdleSave";
const TICK_MS = 100;
const AUTOSAVE_INTERVAL_MS = 10_000;
const OFFLINE_CAP_MS = 8 * 60 * 60 * 1000;
const OFFLINE_FULL_EFFICIENCY_MS = 10 * 60 * 1000;
const OFFLINE_REDUCED_EFFICIENCY = 0.5;
const ROLLING_WINDOW_MS = 20_000;

const tasks = [
  {
    id: "task1",
    name: "Do a math worksheet for a local high school",
    flavor: "Show your work or the vice principal gets suspicious.",
    baseReward: 1,
    baseDuration: 3,
    unlockAt: { lifetime: 0 },
  },
  {
    id: "task2",
    name: "Sort through grandma’s wedding photos",
    flavor: "She keeps uploading the same 600 pictures.",
    baseReward: 5,
    baseDuration: 5,
    unlockAt: { lifetime: 10 },
  },
  {
    id: "task3",
    name: "Transcribe the mayor’s podcast",
    flavor: "20 minutes of ums, ahs, and ‘let me be clear’.",
    baseReward: 20,
    baseDuration: 8,
    unlockAt: { lifetime: 60 },
  },
  {
    id: "task4",
    name: "Moderate a sleepy forum",
    flavor: "Ban three bots, congratulate two cats.",
    baseReward: 75,
    baseDuration: 10,
    unlockAt: { lifetime: 250 },
  },
  {
    id: "task5",
    name: "Auto-reply to corporate emails",
    flavor: "Hit send. Pray nobody reads it.",
    baseReward: 300,
    baseDuration: 12,
    unlockAt: { lifetime: 1_200 },
  },
  {
    id: "task6",
    name: "Debug the smart toaster",
    flavor: "It keeps unsubscribing from bread.",
    baseReward: 1_200,
    baseDuration: 15,
    unlockAt: { lifetime: 4_000 },
  },
  {
    id: "task7",
    name: "Label 10k cat pictures",
    flavor: "Every cat is named Chairman Meow.",
    baseReward: 5_000,
    baseDuration: 18,
    unlockAt: { lifetime: 15_000 },
  },
  {
    id: "task8",
    name: "Automate a coffee shop’s POS",
    flavor: "Turn frappuccino into JSON.",
    baseReward: 20_000,
    baseDuration: 22,
    unlockAt: { lifetime: 60_000 },
  },
  {
    id: "task9",
    name: "Forecast turnip futures",
    flavor: "Stonks? No, veggies.",
    baseReward: 80_000,
    baseDuration: 30,
    unlockAt: { lifetime: 200_000 },
  },
  {
    id: "task10",
    name: "Refactor a unicorn startup’s codebase",
    flavor: "Everything is legacy including the interns.",
    baseReward: 150_000,
    baseDuration: 60,
    unlockAt: { lifetime: 600_000 },
  },
  {
    id: "task11",
    name: "Run due diligence on a blockchain",
    flavor: "It’s turtles, tokens, and towels all the way down.",
    baseReward: 600_000,
    baseDuration: 75,
    unlockAt: { lifetime: 2_000_000 },
  },
  {
    id: "task12",
    name: "Write grant proposals for robots",
    flavor: "Funding hope, one AI tear at a time.",
    baseReward: 2_500_000,
    baseDuration: 90,
    unlockAt: { lifetime: 7_500_000 },
  },
  {
    id: "task13",
    name: "Architect a city traffic AI",
    flavor: "Convince the cars to play nice.",
    baseReward: 8_000_000,
    baseDuration: 100,
    unlockAt: { lifetime: 18_000_000 },
  },
  {
    id: "task14",
    name: "Simulate the weather on Mars",
    flavor: "Mostly dust with a chance of dust.",
    baseReward: 15_000_000,
    baseDuration: 110,
    unlockAt: { lifetime: 25_000_000 },
  },
  {
    id: "task15",
    name: "Fix NASA’s database issues",
    flavor: "Legacy COBOL meets moon rocks.",
    baseReward: 25_000_000,
    baseDuration: 120,
    unlockAt: { lifetime: 40_000_000 },
  },
  {
    id: "task16",
    name: "Cure cancer?",
    flavor: "Just a casual Wednesday.",
    baseReward: 150_000_000,
    baseDuration: 180,
    unlockAt: { lifetime: 125_000_000 },
  },
];

const items = [
  {
    id: "rustyRam",
    name: "Rusty RAM Chip",
    desc: "Speed +10% per level.",
    baseCost: 10,
    costGrowth: 1.15,
    maxLevel: 50,
    effectType: "speedPercent",
    effectPerLevel: 0.1,
    unlockedAt: { lifetime: 0 },
  },
  {
    id: "bargainCooler",
    name: "Bargain CPU Cooler",
    desc: "Reduces imaginary heat drag. Speed +2% per level.",
    baseCost: 25,
    costGrowth: 1.17,
    maxLevel: 60,
    effectType: "speedPercent",
    effectPerLevel: 0.02,
    unlockedAt: { lifetime: 30 },
  },
  {
    id: "cheapGpu",
    name: "Cheap GPU",
    desc: "Reward +5% per level.",
    baseCost: 50,
    costGrowth: 1.18,
    maxLevel: 60,
    effectType: "rewardPercent",
    effectPerLevel: 0.05,
    unlockedAt: { lifetime: 80 },
  },
  {
    id: "qaDucks",
    name: "QA Rubber Duck Army",
    desc: "Unlocks automation when purchased.",
    baseCost: 250,
    costGrowth: 2.5,
    maxLevel: 1,
    effectType: "automation",
    effectPerLevel: 1,
    unlockedAt: { lifetime: 600 },
  },
  {
    id: "queueManager",
    name: "Queue Manager v1",
    desc: "Adds one parallel task slot per level.",
    baseCost: 1_000,
    costGrowth: 2.2,
    maxLevel: 3,
    effectType: "slots",
    effectPerLevel: 1,
    unlockedAt: { lifetime: 3_000 },
  },
  {
    id: "cloudTier",
    name: "Cloud Free Tier",
    desc: "Offline efficiency +10% (beyond 10m) per level.",
    baseCost: 2_500,
    costGrowth: 2.0,
    maxLevel: 5,
    effectType: "offlineEfficiency",
    effectPerLevel: 0.1,
    unlockedAt: { lifetime: 7_500 },
  },
  {
    id: "enterpriseScheduler",
    name: "Enterprise Scheduler",
    desc: "Global speed +25% per level.",
    baseCost: 10_000,
    costGrowth: 2.4,
    maxLevel: 10,
    effectType: "speedMultiplier",
    effectPerLevel: 1.25,
    unlockedAt: { lifetime: 25_000 },
  },
  {
    id: "labelInterns",
    name: "Data Labeling Interns",
    desc: "Reward +20% per level.",
    baseCost: 20_000,
    costGrowth: 2.3,
    maxLevel: 10,
    effectType: "rewardPercent",
    effectPerLevel: 0.2,
    unlockedAt: { lifetime: 60_000 },
  },
  {
    id: "abTesting",
    name: "A/B Testing Toolkit",
    desc: "Current task duration -20% per level (additive).",
    baseCost: 50_000,
    costGrowth: 2.6,
    maxLevel: 5,
    effectType: "taskDurationReduction",
    effectPerLevel: 0.2,
    unlockedAt: { lifetime: 150_000 },
  },
  {
    id: "quantumAccelerator",
    name: "Quantum-ish Accelerator",
    desc: "Doubles speed per level.",
    baseCost: 500_000,
    costGrowth: 3.2,
    maxLevel: 5,
    effectType: "speedMultiplier",
    effectPerLevel: 2,
    unlockedAt: { lifetime: 1_500_000 },
  },
  {
    id: "fusionRam",
    name: "Fusion-Powered RAM Chip",
    desc: "Triples rewards per level.",
    baseCost: 5_000_000,
    costGrowth: 3.5,
    maxLevel: 5,
    effectType: "rewardMultiplier",
    effectPerLevel: 3,
    unlockedAt: { lifetime: 10_000_000 },
  },
  {
    id: "paperclipToggle",
    name: "Paperclip Maximizer Toggle",
    desc: "Siphons 5% of rewards per level into prestige bank.",
    baseCost: 20_000_000,
    costGrowth: 4.0,
    maxLevel: 5,
    effectType: "prestigeSiphon",
    effectPerLevel: 0.05,
    unlockedAt: { lifetime: 50_000_000 },
  },
];

const itemMap = new Map(items.map((item) => [item.id, item]));

const ACHIEVEMENTS = {
  firstDollar: {
    name: "Pocket Change",
    description: "Earn your first dollar.",
  },
  firstAutomation: {
    name: "Delegation Nation",
    description: "Unlock automation.",
  },
  oneK: {
    name: "Four Digits of Glory",
    description: "Earn $1K lifetime.",
  },
  oneMillion: {
    name: "Seven Figure Friend",
    description: "Earn $1M lifetime.",
  },
  oneBillion: {
    name: "Nine Zero Hero",
    description: "Earn $1B lifetime.",
  },
  twoSlots: {
    name: "Parallel Play",
    description: "Run two tasks at once.",
  },
  firstPrestige: {
    name: "Factory Reset",
    description: "Prestige for the first time.",
  },
};

const dom = {
  moneyDisplay: document.getElementById("moneyDisplay"),
  lifetimeDisplay: document.getElementById("lifetimeDisplay"),
  ccDisplay: document.getElementById("ccDisplay"),
  speedMultDisplay: document.getElementById("speedMultDisplay"),
  rewardMultDisplay: document.getElementById("rewardMultDisplay"),
  taskSelection: document.getElementById("taskSelection"),
  activeSlots: document.getElementById("activeSlots"),
  startTaskBtn: document.getElementById("startTaskBtn"),
  stopTaskBtn: document.getElementById("stopTaskBtn"),
  prevTaskBtn: document.getElementById("prevTaskBtn"),
  nextTaskBtn: document.getElementById("nextTaskBtn"),
  automationToggle: document.getElementById("automationToggle"),
  shopItems: document.getElementById("shopItems"),
  playtimeDisplay: document.getElementById("playtimeDisplay"),
  tasksCompletedDisplay: document.getElementById("tasksCompletedDisplay"),
  dpsDisplay: document.getElementById("dpsDisplay"),
  achievementList: document.getElementById("achievementList"),
  prestigeButton: document.getElementById("prestigeButton"),
  prestigeInfo: document.getElementById("prestigeInfo"),
  projectedCCDisplay: document.getElementById("projectedCCDisplay"),
  manualSaveButton: document.getElementById("manualSaveButton"),
  exportButton: document.getElementById("exportButton"),
  importInput: document.getElementById("importInput"),
  prestigeModal: document.getElementById("prestigeModal"),
  modalProjectedCC: document.getElementById("modalProjectedCC"),
  confirmPrestigeButton: document.getElementById("confirmPrestigeButton"),
  cancelPrestigeButton: document.getElementById("cancelPrestigeButton"),
  toastContainer: document.getElementById("toastContainer"),
};

function createDefaultState() {
  const itemLevels = {};
  items.forEach((item) => {
    itemLevels[item.id] = 0;
  });

  return {
    version: GAME_VERSION,
    money: 0,
    lifetimeEarnings: 0,
    prestigeBank: 0,
    computeCores: 0,
    selectedTaskId: tasks[0].id,
    unlockedTaskIds: [tasks[0].id],
    taskCompletionCounts: {},
    taskQueue: [],
    automationUnlocked: false,
    automationEnabled: false,
    items: itemLevels,
    activeSlots: [],
    stats: {
      tasksCompleted: 0,
      prestigeCount: 0,
    },
    achievements: {},
    achievementLog: [],
    incomeHistory: [],
    totalPlaytimeMs: 0,
    lastSaved: null,
    lastTickTime: Date.now(),
  };
}

let state = createDefaultState();
let autosaveTimer = null;
let gameLoop = null;
let suppressToasts = false;

function loadGame() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) {
      state = createDefaultState();
      return;
    }
    const data = JSON.parse(raw);
    migrateSave(data);
    state = { ...createDefaultState(), ...data };
    // Merge nested structures safely.
    state.items = { ...createDefaultState().items, ...data.items };
    state.unlockedTaskIds = Array.isArray(data.unlockedTaskIds)
      ? data.unlockedTaskIds
      : [tasks[0].id];
    state.taskCompletionCounts =
      data.taskCompletionCounts && typeof data.taskCompletionCounts === "object"
        ? { ...data.taskCompletionCounts }
        : {};
    state.taskQueue = Array.isArray(data.taskQueue) ? [...data.taskQueue] : [];
    state.achievements =
      data.achievements && typeof data.achievements === "object"
        ? { ...data.achievements }
        : {};
    state.achievementLog = Array.isArray(data.achievementLog)
      ? [...data.achievementLog]
      : [];
    state.activeSlots = Array.isArray(data.activeSlots)
      ? data.activeSlots.map((slot) =>
          slot ? { taskId: slot.taskId, progressMs: slot.progressMs || 0 } : null
        )
      : [];
    state.incomeHistory = [];
  } catch (err) {
    console.error("Failed to load save:", err);
    state = createDefaultState();
  }
}

function migrateSave(data) {
  if (!data || typeof data !== "object") {
    return;
  }
  if (!Number.isFinite(data.version) || data.version < GAME_VERSION) {
    data.version = GAME_VERSION;
  }
}

function saveGame() {
  const snapshot = {
    ...state,
    incomeHistory: null,
  };
  snapshot.activeSlots = Array.isArray(state.activeSlots)
    ? state.activeSlots.map((slot) =>
        slot ? { taskId: slot.taskId, progressMs: slot.progressMs || 0 } : null
      )
    : [];
  snapshot.incomeHistory = [];
  snapshot.lastSaved = Date.now();
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(snapshot));
    state.lastSaved = snapshot.lastSaved;
  } catch (err) {
    console.error("Failed to save:", err);
  }
}

function exportGame() {
  const payload = {
    ...state,
    activeSlots: [],
    incomeHistory: [],
    exportTime: Date.now(),
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `assembly-idle-save-${new Date().toISOString()}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast("Save exported.");
}

function importGame(file) {
  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const data = JSON.parse(event.target.result);
      migrateSave(data);
      state = { ...createDefaultState(), ...data };
      state.items = { ...createDefaultState().items, ...data.items };
      state.unlockedTaskIds = Array.isArray(data.unlockedTaskIds)
        ? data.unlockedTaskIds
        : [tasks[0].id];
      state.taskQueue = Array.isArray(data.taskQueue)
        ? [...data.taskQueue]
        : [];
      state.taskCompletionCounts =
        data.taskCompletionCounts && typeof data.taskCompletionCounts === "object"
          ? { ...data.taskCompletionCounts }
          : {};
      state.achievements =
        data.achievements && typeof data.achievements === "object"
          ? { ...data.achievements }
          : {};
      state.achievementLog = Array.isArray(data.achievementLog)
        ? [...data.achievementLog]
        : [];
      state.activeSlots = Array.isArray(data.activeSlots)
        ? data.activeSlots.map((slot) =>
            slot ? { taskId: slot.taskId, progressMs: slot.progressMs || 0 } : null
          )
        : [];
      resetTransientState();
      ensureSlotCount();
      updateAutomationUnlocks();
      unlockTasksIfNeeded();
      renderAll();
      showToast("Save imported.");
    } catch (err) {
      console.error("Failed to import save:", err);
      showToast("Import failed.", true);
    }
  };
  reader.readAsText(file);
}

function resetTransientState() {
  if (!Array.isArray(state.activeSlots)) {
    state.activeSlots = [];
  }
  state.incomeHistory = [];
  state.lastTickTime = Date.now();
}

function ensureSlotCount() {
  const desired = getMaxSlots();
  if (!Array.isArray(state.activeSlots)) {
    state.activeSlots = [];
  }
  while (state.activeSlots.length < desired) {
    state.activeSlots.push(null);
  }
  if (state.activeSlots.length > desired) {
    state.activeSlots.length = desired;
  }
}

function getItemLevel(id) {
  return state.items[id] || 0;
}

function getTaskById(id) {
  return tasks.find((task) => task.id === id);
}

function calculatePrestigeMultiplier() {
  return Math.pow(1.04, state.computeCores || 0);
}

function calculateSpeedMultiplier() {
  let mult = 1;
  mult *= 1 + 0.1 * getItemLevel("rustyRam");
  mult *= 1 + 0.02 * getItemLevel("bargainCooler");
  mult *= Math.pow(1.25, getItemLevel("enterpriseScheduler"));
  mult *= Math.pow(2, getItemLevel("quantumAccelerator"));
  mult *= calculatePrestigeMultiplier();
  return mult;
}

function calculateRewardMultiplier() {
  let mult = 1;
  mult *= 1 + 0.05 * getItemLevel("cheapGpu");
  mult *= 1 + 0.2 * getItemLevel("labelInterns");
  mult *= Math.pow(3, getItemLevel("fusionRam"));
  mult *= calculatePrestigeMultiplier();
  return mult;
}

function getTaskDurationFactor() {
  const level = getItemLevel("abTesting");
  if (!level) return 1;
  return Math.max(0.2, 1 - 0.2 * level);
}

function getPrestigeSiphonPercent() {
  const level = getItemLevel("paperclipToggle");
  return Math.min(0.25, level * 0.05);
}

function getOfflineEfficiency() {
  const base = OFFLINE_REDUCED_EFFICIENCY;
  const level = getItemLevel("cloudTier");
  return Math.min(1, base + level * 0.1);
}

function getMaxSlots() {
  return 1 + getItemLevel("queueManager");
}

function getQueueLimit() {
  return 3 + getItemLevel("queueManager");
}

function fmtMoney(value) {
  if (!Number.isFinite(value)) return "$?";
  const abs = Math.abs(value);
  const suffixes = [
    { value: 1e12, suffix: "T" },
    { value: 1e9, suffix: "B" },
    { value: 1e6, suffix: "M" },
    { value: 1e3, suffix: "K" },
  ];
  for (const { value: threshold, suffix } of suffixes) {
    if (abs >= threshold) {
      return `$${(value / threshold).toFixed(2)}${suffix}`;
    }
  }
  return `$${value.toFixed(value >= 10 ? 0 : 2)}`;
}

function fmtTimeSeconds(seconds) {
  if (!Number.isFinite(seconds) || seconds === Infinity) {
    return "∞";
  }
  if (seconds < 0) seconds = 0;
  const totalSeconds = Math.ceil(seconds);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;
  if (hours > 0) {
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  return `${minutes.toString().padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}`;
}

function estimateDPS() {
  const now = Date.now();
  state.incomeHistory = state.incomeHistory.filter(
    (entry) => now - entry.time <= ROLLING_WINDOW_MS
  );
  if (state.incomeHistory.length === 0) return 0;
  const sum = state.incomeHistory.reduce((acc, entry) => acc + entry.amount, 0);
  const window =
    Math.max(1_000, now - state.incomeHistory[0].time) / 1000; // seconds
  return sum / window;
}

function timeToAfford(cost) {
  const missing = Math.max(0, cost - state.money);
  if (missing <= 0) return 0;
  const dps = estimateDPS();
  if (dps <= 1e-9) return Infinity;
  return missing / dps;
}

function isTaskUnlocked(task) {
  if (state.unlockedTaskIds.includes(task.id)) return true;
  const lifetimeReq = task.unlockAt?.lifetime ?? 0;
  const completionReq = task.unlockAt?.completions ?? 0;
  const meetsLifetime = state.lifetimeEarnings >= lifetimeReq;
  const meetsCompletion =
    (state.taskCompletionCounts[task.id] || 0) >= completionReq;
  return meetsLifetime && meetsCompletion;
}

function unlockTasksIfNeeded() {
  let changed = false;
  tasks.forEach((task) => {
    if (!state.unlockedTaskIds.includes(task.id) && isTaskUnlocked(task)) {
      state.unlockedTaskIds.push(task.id);
      changed = true;
      if (!suppressToasts) {
        showToast(`Unlocked task: ${task.name}`);
      }
    }
  });
  if (changed) {
    renderTasks();
  }
}

function getSelectedTask() {
  const task = getTaskById(state.selectedTaskId);
  if (task && isTaskUnlocked(task)) {
    return task;
  }
  const fallbackId = state.unlockedTaskIds[0] || tasks[0].id;
  state.selectedTaskId = fallbackId;
  return getTaskById(fallbackId);
}

function queueTask(taskId) {
  if (state.taskQueue.length >= getQueueLimit()) return false;
  state.taskQueue.push(taskId);
  return true;
}

function startSelectedTask() {
  const task = getSelectedTask();
  if (!task) return;
  if (!isTaskUnlocked(task)) return;
  if (!queueTask(task.id)) {
    showToast("Queue is full.", true);
    return;
  }
  assignTasksToSlots();
  renderSlots();
}

function stopAllTasks() {
  state.taskQueue = [];
  state.activeSlots = state.activeSlots.map(() => null);
  renderSlots();
}

function assignTasksToSlots() {
  ensureSlotCount();
  for (let i = 0; i < state.activeSlots.length; i += 1) {
    if (!state.activeSlots[i] && state.taskQueue.length > 0) {
      const taskId = state.taskQueue.shift();
      state.activeSlots[i] = {
        taskId,
        progressMs: 0,
      };
    }
  }
}

function processSlots(deltaMs, { offline = false } = {}) {
  ensureSlotCount();
  const speedMult = calculateSpeedMultiplier();
  let anyCompleted = false;
  for (let i = 0; i < state.activeSlots.length; i += 1) {
    const slot = state.activeSlots[i];
    if (!slot) continue;
    const task = getTaskById(slot.taskId);
    if (!task) {
      state.activeSlots[i] = null;
      continue;
    }
    const durationTarget =
      task.baseDuration * 1000 * (task.durationMult || 1) * getTaskDurationFactor();
    slot.progressMs += deltaMs * speedMult;
    if (slot.progressMs >= durationTarget) {
      completeTask(task, { offline });
      state.activeSlots[i] = null;
      anyCompleted = true;
      if (state.automationEnabled && !offline) {
        queueTask(state.selectedTaskId);
      }
    }
  }
  if (anyCompleted) {
    assignTasksToSlots();
  }
}

function completeTask(task, { offline = false } = {}) {
  const rewardMult = calculateRewardMultiplier();
  const reward = task.baseReward * (task.rewardMult || 1) * rewardMult;
  const siphonPercent = getPrestigeSiphonPercent();
  const siphoned = reward * siphonPercent;
  const payout = reward - siphoned;

  state.money += payout;
  state.lifetimeEarnings += reward;
  state.prestigeBank += siphoned;
  state.stats.tasksCompleted += 1;
  state.taskCompletionCounts[task.id] =
    (state.taskCompletionCounts[task.id] || 0) + 1;

  if (!offline) {
    state.incomeHistory.push({ time: Date.now(), amount: reward });
  }

  unlockTasksIfNeeded();
  checkMoneyAchievements();
}

function toggleAutomation() {
  if (!state.automationUnlocked) return;
  state.automationEnabled = !state.automationEnabled;
  dom.automationToggle.textContent = state.automationEnabled
    ? "Automation On"
    : "Automation Off";
}

function calculateProjectedCores() {
  const prestigeValue = state.lifetimeEarnings + state.prestigeBank;
  return Math.floor(Math.sqrt(prestigeValue / 1_000_000));
}

function canPrestige() {
  const playtimeReady = state.totalPlaytimeMs >= 20 * 60 * 1000;
  const hasHighTask = state.unlockedTaskIds.some((id) => {
    const task = getTaskById(id);
    return task && task.baseReward >= 25_000_000;
  });
  return calculateProjectedCores() > state.computeCores && (playtimeReady || hasHighTask);
}

function performPrestige() {
  const projected = calculateProjectedCores();
  const gain = projected - state.computeCores;
  if (gain <= 0) {
    dom.prestigeModal.classList.add("hidden");
    return;
  }
  state.computeCores = projected;
  state.prestigeBank = 0;
  state.money = 0;
  state.taskQueue = [];
  state.activeSlots = [];
  state.items = createDefaultState().items;
  state.unlockedTaskIds = [tasks[0].id];
  state.selectedTaskId = tasks[0].id;
  state.taskCompletionCounts = {};
  state.automationUnlocked = false;
  state.automationEnabled = false;
  state.stats.prestigeCount += 1;
  dom.automationToggle.disabled = true;
  dom.automationToggle.textContent = "Automation Off";
  checkAchievements("firstPrestige");
  unlockTasksIfNeeded();
  ensureSlotCount();
  state.incomeHistory = [];
  renderAll();
  showToast(`Prestiged! +${gain} Compute Cores.`);
}

function updateAutomationUnlocks() {
  const unlocked = getItemLevel("qaDucks") > 0;
  if (unlocked && !state.automationUnlocked) {
    state.automationUnlocked = true;
    dom.automationToggle.disabled = false;
    showToast("Automation unlocked!");
    checkAchievements("firstAutomation");
  } else if (!unlocked) {
    state.automationUnlocked = false;
    dom.automationToggle.disabled = true;
    state.automationEnabled = false;
    dom.automationToggle.textContent = "Automation Off";
  }
}

function checkMoneyAchievements() {
  checkAchievements("firstDollar", state.lifetimeEarnings >= 1);
  checkAchievements("oneK", state.lifetimeEarnings >= 1_000);
  checkAchievements("oneMillion", state.lifetimeEarnings >= 1_000_000);
  checkAchievements("oneBillion", state.lifetimeEarnings >= 1_000_000_000);
  if (getMaxSlots() >= 2) {
    checkAchievements("twoSlots", true);
  }
}

function checkAchievements(id, condition = true) {
  if (!ACHIEVEMENTS[id] || !condition) return;
  if (state.achievements[id]) return;
  const achievement = { ...ACHIEVEMENTS[id], unlockedAt: Date.now() };
  state.achievements[id] = achievement;
  state.achievementLog.push(achievement);
  if (!suppressToasts) {
    showToast(`Achievement unlocked: ${achievement.name}`);
  }
  renderAchievements();
}

function showToast(message, isError = false) {
  if (suppressToasts) return;
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  if (isError) {
    toast.style.borderColor = "rgba(255, 80, 80, 0.7)";
    toast.style.background = "rgba(255, 80, 80, 0.2)";
  }
  dom.toastContainer.appendChild(toast);
  setTimeout(() => {
    toast.classList.add("fade-out");
    toast.style.opacity = "0";
    setTimeout(() => toast.remove(), 400);
  }, 3000);
}

function renderHeader() {
  dom.moneyDisplay.textContent = fmtMoney(state.money);
  dom.lifetimeDisplay.textContent = fmtMoney(state.lifetimeEarnings);
  dom.ccDisplay.textContent = `${state.computeCores}`;
  dom.speedMultDisplay.textContent = `${calculateSpeedMultiplier().toFixed(2)}×`;
  dom.rewardMultDisplay.textContent = `${calculateRewardMultiplier().toFixed(2)}×`;
}

function renderTasks() {
  const selected = state.selectedTaskId;
  dom.taskSelection.innerHTML = "";
  tasks.forEach((task) => {
    const unlocked = isTaskUnlocked(task);
    const card = document.createElement("div");
    card.className = "task-card";
    if (!unlocked) card.classList.add("locked");
    if (task.id === selected) card.classList.add("selected");
    card.dataset.taskId = task.id;
    const durationSeconds =
      task.baseDuration * (task.durationMult || 1) * getTaskDurationFactor();
    const effectiveReward =
      task.baseReward * (task.rewardMult || 1) * calculateRewardMultiplier();
    card.title = unlocked
      ? `Reward: ${fmtMoney(effectiveReward)} • Duration: ${fmtTimeSeconds(
          durationSeconds
        )}`
      : `Unlocks at ${fmtMoney(task.unlockAt?.lifetime || 0)} lifetime earnings.`;
    const title = document.createElement("h3");
    title.textContent = task.name;
    const flavor = document.createElement("p");
    flavor.className = "task-flavor";
    flavor.textContent = task.flavor;
    card.appendChild(title);
    card.appendChild(flavor);
    card.addEventListener("click", () => {
      if (!unlocked) return;
      state.selectedTaskId = task.id;
      renderTasks();
    });
    dom.taskSelection.appendChild(card);
  });
}

function renderSlots() {
  dom.activeSlots.innerHTML = "";
  const queueInfo = document.createElement("p");
  queueInfo.textContent = `Queue: ${state.taskQueue.length}/${getQueueLimit()}`;
  queueInfo.style.opacity = "0.7";
  dom.activeSlots.appendChild(queueInfo);

  state.activeSlots.forEach((slot, index) => {
    const slotEl = document.createElement("div");
    slotEl.className = "slot";
    const header = document.createElement("div");
    header.className = "slot-header";
    if (!slot) {
      header.textContent = `Slot ${index + 1}: Idle`;
      slotEl.appendChild(header);
      dom.activeSlots.appendChild(slotEl);
      return;
    }
    const task = getTaskById(slot.taskId);
    if (!task) {
      header.textContent = `Slot ${index + 1}: (unknown task)`;
      slotEl.appendChild(header);
      dom.activeSlots.appendChild(slotEl);
      return;
    }
    const durationTarget =
      task.baseDuration * 1000 * (task.durationMult || 1) * getTaskDurationFactor();
    const progress = Math.min(1, slot.progressMs / durationTarget);
    header.textContent = `Slot ${index + 1}: ${task.name}`;
    const progressText = document.createElement("span");
    progressText.textContent = `${Math.floor(progress * 100)}%`;
    header.appendChild(progressText);
    slotEl.appendChild(header);

    const bar = document.createElement("div");
    bar.className = "progress-track";
    const fill = document.createElement("div");
    fill.className = "progress-fill";
    fill.style.width = `${progress * 100}%`;
    bar.appendChild(fill);
    slotEl.appendChild(bar);
    dom.activeSlots.appendChild(slotEl);
  });
}

function calculateItemCost(item, level) {
  return item.baseCost * Math.pow(item.costGrowth, level);
}

function renderShop() {
  dom.shopItems.innerHTML = "";
  let visibleIndex = 0;
  items.forEach((item) => {
    const level = getItemLevel(item.id);
    const unlocked =
      (item.unlockedAt?.lifetime ?? 0) <= state.lifetimeEarnings ||
      state.items[item.id] > 0;
    const cost = calculateItemCost(item, level);
    const itemRow = document.createElement("div");
    itemRow.className = "shop-item";
    if (!unlocked) {
      itemRow.classList.add("locked");
    }

    const info = document.createElement("div");
    info.className = "shop-item-info";
    const name = document.createElement("h3");
    name.textContent = item.name;
    const desc = document.createElement("p");
    desc.textContent = item.desc;
    info.appendChild(name);
    info.appendChild(desc);

    const meta = document.createElement("div");
    meta.className = "shop-item-meta";
    const levelSpan = document.createElement("span");
    levelSpan.textContent =
      item.maxLevel != null
        ? `Level: ${level}/${item.maxLevel}`
        : `Level: ${level}`;
    const costSpan = document.createElement("span");
    costSpan.textContent = `Cost: ${fmtMoney(cost)}`;
    const etaSpan = document.createElement("span");
    const eta = timeToAfford(cost);
    etaSpan.textContent =
      eta === 0 ? "Ready" : `Time to afford: ${fmtTimeSeconds(eta)}`;
    meta.appendChild(levelSpan);
    meta.appendChild(costSpan);
    meta.appendChild(etaSpan);

    const button = document.createElement("button");
    button.textContent = "Buy";
    button.disabled =
      !unlocked ||
      state.money < cost ||
      (item.maxLevel != null && level >= item.maxLevel);
    button.addEventListener("click", () => purchaseItem(item));
    button.setAttribute("aria-label", `Buy ${item.name}`);
    button.title = eta === 0 ? "Affordable now." : `ETA ${fmtTimeSeconds(eta)}`;

    itemRow.appendChild(info);
    itemRow.appendChild(meta);
    itemRow.appendChild(button);
    dom.shopItems.appendChild(itemRow);

    if (unlocked && visibleIndex < 3) {
      itemRow.dataset.visibleIndex = visibleIndex;
      visibleIndex += 1;
    }
  });
}

function renderStats() {
  dom.playtimeDisplay.textContent = fmtTimeSeconds(state.totalPlaytimeMs / 1000);
  dom.tasksCompletedDisplay.textContent = `${state.stats.tasksCompleted}`;
  const dps = estimateDPS();
  dom.dpsDisplay.textContent = dps > 0 ? `${fmtMoney(dps)}/s` : "--";
  dom.projectedCCDisplay.textContent = `${calculateProjectedCores()}`;

  const prestigeReady = canPrestige();
  dom.prestigeButton.disabled = !prestigeReady;
  dom.prestigeInfo.textContent = prestigeReady
    ? "Prestige is ready whenever you are."
    : "Build more momentum before prestiging.";
}

function renderAchievements() {
  dom.achievementList.innerHTML = "";
  const entries = Object.values(state.achievements).sort(
    (a, b) => a.unlockedAt - b.unlockedAt
  );
  entries.forEach((achievement) => {
    const li = document.createElement("li");
    li.textContent = `${achievement.name} — ${achievement.description}`;
    dom.achievementList.appendChild(li);
  });
}

function renderAll() {
  renderHeader();
  renderTasks();
  renderSlots();
  renderShop();
  renderStats();
  renderAchievements();
}

function purchaseItem(item) {
  const level = getItemLevel(item.id);
  if (item.maxLevel != null && level >= item.maxLevel) return;
  const cost = calculateItemCost(item, level);
  if (state.money < cost) return;
  state.money -= cost;
  state.items[item.id] = level + 1;
  applyItemEffects(item);
  renderAll();
  showToast(`Purchased ${item.name}.`);
}

function applyItemEffects(item) {
  switch (item.effectType) {
    case "automation":
      updateAutomationUnlocks();
      break;
    case "slots":
      ensureSlotCount();
      checkMoneyAchievements();
      break;
    default:
      break;
  }
}

function applyOfflineProgress() {
  if (!state.lastSaved) return;
  const now = Date.now();
  const elapsed = Math.min(now - state.lastSaved, OFFLINE_CAP_MS);
  if (elapsed <= 0) return;
  let effectiveMs = Math.min(elapsed, OFFLINE_FULL_EFFICIENCY_MS);
  const remaining = elapsed - OFFLINE_FULL_EFFICIENCY_MS;
  if (remaining > 0) {
    effectiveMs += remaining * getOfflineEfficiency();
  }
  suppressToasts = true;
  assignTasksToSlots();
  let remainingMs = effectiveMs;
  const chunk = 500; // ms per mini chunk to keep loops manageable.
  while (remainingMs > 0) {
    const delta = Math.min(chunk, remainingMs);
    processTick(delta, { offline: true });
    remainingMs -= delta;
  }
  if (state.automationEnabled && state.taskQueue.length === 0) {
    queueTask(state.selectedTaskId);
    assignTasksToSlots();
  }
  suppressToasts = false;
  renderAll();
  showToast(
    `Processed ${fmtTimeSeconds(effectiveMs / 1000)} of offline work.`,
    false
  );
}

function processTick(deltaMs, { offline = false } = {}) {
  state.totalPlaytimeMs += offline ? 0 : deltaMs;
  processSlots(deltaMs, { offline });
  assignTasksToSlots();
  if (!offline) {
    renderHeader();
    renderSlots();
    renderStats();
  }
}

function gameTick() {
  const now = Date.now();
  const delta = Math.min(TICK_MS * 2, now - state.lastTickTime);
  state.lastTickTime = now;
  processTick(delta);
}

function setupEventListeners() {
  dom.startTaskBtn.addEventListener("click", startSelectedTask);
  dom.stopTaskBtn.addEventListener("click", stopAllTasks);
  dom.automationToggle.addEventListener("click", toggleAutomation);
  dom.prestigeButton.addEventListener("click", () => {
    if (!canPrestige()) return;
    dom.modalProjectedCC.textContent = `${calculateProjectedCores() - state.computeCores}`;
    dom.prestigeModal.classList.remove("hidden");
  });
  dom.confirmPrestigeButton.addEventListener("click", () => {
    dom.prestigeModal.classList.add("hidden");
    performPrestige();
  });
  dom.cancelPrestigeButton.addEventListener("click", () => {
    dom.prestigeModal.classList.add("hidden");
  });
  dom.prevTaskBtn.addEventListener("click", selectPrevTask);
  dom.nextTaskBtn.addEventListener("click", selectNextTask);
  dom.manualSaveButton.addEventListener("click", () => {
    saveGame();
    showToast("Game saved.");
  });
  dom.exportButton.addEventListener("click", exportGame);
  dom.importInput.addEventListener("change", (event) => {
    const file = event.target.files?.[0];
    if (file) {
      importGame(file);
    }
    dom.importInput.value = "";
  });
  window.addEventListener("beforeunload", saveGame);
  document.addEventListener("keydown", handleKeybinds);
}

function handleKeybinds(event) {
  if (event.repeat) return;
  switch (event.code) {
    case "Digit1":
      startSelectedTask();
      break;
    case "KeyA":
      selectPrevTask();
      break;
    case "KeyZ":
      selectNextTask();
      break;
    case "KeyP":
      if (canPrestige()) {
        dom.modalProjectedCC.textContent = `${calculateProjectedCores() - state.computeCores}`;
        dom.prestigeModal.classList.remove("hidden");
      }
      break;
    case "KeyQ":
    case "KeyW":
    case "KeyE":
      handleQuickBuy(event.code);
      break;
    default:
      break;
  }
}

function selectPrevTask() {
  const unlockedTasks = tasks.filter((task) => isTaskUnlocked(task));
  const index = unlockedTasks.findIndex(
    (task) => task.id === state.selectedTaskId
  );
  if (index > 0) {
    state.selectedTaskId = unlockedTasks[index - 1].id;
    renderTasks();
  }
}

function selectNextTask() {
  const unlockedTasks = tasks.filter((task) => isTaskUnlocked(task));
  const index = unlockedTasks.findIndex(
    (task) => task.id === state.selectedTaskId
  );
  if (index >= 0 && index < unlockedTasks.length - 1) {
    state.selectedTaskId = unlockedTasks[index + 1].id;
    renderTasks();
  }
}

function handleQuickBuy(code) {
  const indices = { KeyQ: 0, KeyW: 1, KeyE: 2 };
  const idx = indices[code];
  const visible = Array.from(dom.shopItems.children).filter((child) =>
    child.dataset?.visibleIndex ? true : false
  );
  const itemRow = visible.find((child) => Number(child.dataset.visibleIndex) === idx);
  if (!itemRow) return;
  const button = itemRow.querySelector("button");
  if (button && !button.disabled) {
    button.click();
  }
}

function startAutosave() {
  if (autosaveTimer) clearInterval(autosaveTimer);
  autosaveTimer = setInterval(saveGame, AUTOSAVE_INTERVAL_MS);
}

function startGameLoop() {
  if (gameLoop) clearInterval(gameLoop);
  state.lastTickTime = Date.now();
  gameLoop = setInterval(gameTick, TICK_MS);
}

function init() {
  loadGame();
  resetTransientState();
  ensureSlotCount();
  updateAutomationUnlocks();
  unlockTasksIfNeeded();
  renderAll();
  setupEventListeners();
  applyOfflineProgress();
  startGameLoop();
  startAutosave();
  checkMoneyAchievements();
}

init();
