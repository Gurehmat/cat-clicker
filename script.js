// ./js/script.js
window.addEventListener("load", function () {
  // Game data
  const gameState = {
    cats: 0,
    clickPower: 1,
    upgradesOwned: 0,
    autoSpeedMs: 0,
    autoTimerId: null,
    upgrades: [
      { id: "box", name: "Fancy Cardboard Box", cost: 15, type: "click", value: 1, owned: 0 },
      { id: "laser", name: "Laser Pointer", cost: 100, type: "click", value: 5, owned: 0 },
      { id: "catnip", name: "Aged Catnip", cost: 500, type: "click", value: 20, owned: 0 },
      { id: "feeder", name: "Automatic Feeder", cost: 200, type: "auto", owned: 0 }
    ],
    rewards: [
      { id: "welcome", name: "Warm Welcome", limit: 10, key: "cats", earned: false, icon: "🧶" },
      { id: "hoarder", name: "Hoarder", limit: 500, key: "cats", earned: false, icon: "📦" },
      { id: "collector", name: "Collector", limit: 5, key: "upgradesOwned", earned: false, icon: "🖼️" },
      { id: "super", name: "Super Clicker", limit: 25, key: "clickPower", earned: false, icon: "⚡" },
      { id: "infinite", name: "Infinite Purr", limit: 1000, key: "cats", earned: false, icon: "✨" }
    ]
  };

  // DOM elements
  const el = {
    catButton: document.getElementById("cat"),
    catCount: document.getElementById("cat-count"),
    cps: document.getElementById("cps"),
    statClickVal: document.getElementById("stat-click-val"),
    statUpgradesCount: document.getElementById("stat-upgrades-count"),
    upgradeList: document.getElementById("upgrade-list"),
    rewardsDisplay: document.getElementById("rewards-display"),
    congratsOverlay: document.getElementById("congrats-overlay"),
    rewardName: document.getElementById("reward-name"),
    helpBtn: document.getElementById("help-btn"),
    helpModal: document.getElementById("help-modal"),
    helpContent: document.getElementById("help-content"),
    closeHelp: document.getElementById("close-help")
  };

  // Basic missing element check
  const keys = Object.keys(el);
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    if (!el[key]) {
      console.error("Missing element:", key);
    }
  }

  function canAfford(cost) {
    return gameState.cats >= cost;
  }

  function getCatsPerSecond() {
    if (gameState.autoSpeedMs <= 0) {
      return 0;
    }
    return (1000 / gameState.autoSpeedMs) * gameState.clickPower;
  }

  function showReward(reward) {
    const badge = document.createElement("div");
    badge.className = "badge";
    badge.textContent = reward.icon;
    badge.title = reward.name;
    el.rewardsDisplay.appendChild(badge);

    el.rewardName.textContent = reward.name;
    el.congratsOverlay.classList.remove("hidden");
    setTimeout(function () {
      el.congratsOverlay.classList.add("hidden");
    }, 4000);
  }

  function checkRewards() {
    for (let i = 0; i < gameState.rewards.length; i++) {
      const reward = gameState.rewards[i];

      if (!reward.earned) {
        const current = gameState[reward.key];
        if (current >= reward.limit) {
          reward.earned = true;
          showReward(reward);
        }
      }
    }
  }

  function updateAutoClicker() {
    if (gameState.autoTimerId !== null) {
      clearInterval(gameState.autoTimerId);
      gameState.autoTimerId = null;
    }

    if (gameState.autoSpeedMs === 0) {
      gameState.autoSpeedMs = 2000;
    } else {
      gameState.autoSpeedMs = Math.max(200, Math.floor(gameState.autoSpeedMs * 0.8));
    }

    gameState.autoTimerId = setInterval(function () {
      gameState.cats += gameState.clickPower;
      updateView();
    }, gameState.autoSpeedMs);
  }

  function buyUpgrade(upgradeId) {
    let upgrade = null;

    for (let i = 0; i < gameState.upgrades.length; i++) {
      if (gameState.upgrades[i].id === upgradeId) {
        upgrade = gameState.upgrades[i];
        break;
      }
    }

    if (!upgrade) {
      return;
    }

    if (!canAfford(upgrade.cost)) {
      return;
    }

    gameState.cats -= upgrade.cost;
    upgrade.owned += 1;
    gameState.upgradesOwned += 1;

    if (upgrade.type === "click") {
      gameState.clickPower += upgrade.value;
    } else {
      updateAutoClicker();
    }

    upgrade.cost = Math.ceil(upgrade.cost * 1.5);
    updateView();
  }

  function renderStore() {
    el.upgradeList.innerHTML = "";

    for (let i = 0; i < gameState.upgrades.length; i++) {
      const upgrade = gameState.upgrades[i];
      const button = document.createElement("button");
      button.className = "upgrade-btn";
      button.type = "button";

      let effectText = "Auto-click (faster each purchase)";
      if (upgrade.type === "click") {
        effectText = "+" + upgrade.value + " Click Power";
      }

      button.innerHTML =
        "<strong>" + upgrade.name + "</strong><br>" +
        "Cost: " + upgrade.cost + " cats<br>" +
        "Owned: " + upgrade.owned + "<br>" +
        "<em>" + effectText + "</em>";

      button.disabled = !canAfford(upgrade.cost);
      button.addEventListener("click", function () {
        buyUpgrade(upgrade.id);
      });

      el.upgradeList.appendChild(button);
    }
  }

  function updateView() {
    el.catCount.textContent = Math.floor(gameState.cats) + " cats";
    el.statClickVal.textContent = String(gameState.clickPower);
    el.statUpgradesCount.textContent = String(gameState.upgradesOwned);
    el.cps.textContent = "Per second: " + getCatsPerSecond().toFixed(1);

    renderStore();
    checkRewards();
  }

  function openHelp() {
    let upgradesHtml = "<h4>Upgrades</h4><ul>";
    for (let i = 0; i < gameState.upgrades.length; i++) {
      const u = gameState.upgrades[i];
      let effect = "starts/speeds up auto-click (min 200ms)";
      if (u.type === "click") {
        effect = "+" + u.value + " click power";
      }

      upgradesHtml +=
        "<li><strong>" + u.name + "</strong>: Cost " + u.cost +
        " cats, Owned " + u.owned + ", " + effect + "</li>";
    }
    upgradesHtml += "</ul>";

    let rewardsHtml = "<h4>Rewards</h4><ul>";
    for (let i = 0; i < gameState.rewards.length; i++) {
      const r = gameState.rewards[i];
      rewardsHtml +=
        "<li>" + r.icon + " <strong>" + r.name + "</strong>: Earn at " +
        r.limit + " " + r.key + "</li>";
    }
    rewardsHtml += "</ul>";

    el.helpContent.innerHTML = upgradesHtml + rewardsHtml;
    el.helpModal.classList.remove("hidden");
  }

  function closeHelp() {
    el.helpModal.classList.add("hidden");
  }

  el.catButton.addEventListener("click", function () {
    gameState.cats += gameState.clickPower;
    updateView();
  });

  el.helpBtn.addEventListener("click", openHelp);
  el.closeHelp.addEventListener("click", closeHelp);

  el.helpModal.addEventListener("click", function (event) {
    if (event.target === el.helpModal) {
      closeHelp();
    }
  });

  updateView();
});