```js id="s1l8ur"
const players = [
  {
    name: 'PilotAce',
    tier: 'HT1',
    region: 'NA',
    server: 'Hypixel',
    tester: true
  },
  {
    name: 'SkyHunter',
    tier: 'HT2',
    region: 'EU',
    server: 'PvP Legacy',
    tester: false
  },
  {
    name: 'Falcon',
    tier: 'LT1',
    region: 'NA',
    server: 'MCC Island',
    tester: true
  }
];

const leaderboard = document.getElementById('leaderboard');
const search = document.getElementById('search');

function renderPlayers(list) {
  leaderboard.innerHTML = '';

  if (list.length === 0) {
    leaderboard.innerHTML = `
      <div class="player">
        <h2>No players found.</h2>
      </div>
    `;
    return;
  }

  list.forEach(player => {
    leaderboard.innerHTML += `
      <div class="player" onclick="openProfile('${player.name}')">
        <div>
          <h2>✈️ ${player.name}</h2>
          <p>${player.region} • ${player.server}</p>
        </div>

        <div>
          <h2>${player.tier}</h2>
          <p>${player.tester ? '🛡️ Tester' : '🎖️ Pilot'}</p>
        </div>
      </div>
    `;
  });
}

function filterTier(tier) {
  if (tier === 'all') {
    renderPlayers(players);
    return;
  }

  const filtered = players.filter(
    p => p.tier.toLowerCase() === tier.toLowerCase()
  );

  renderPlayers(filtered);
}

function openProfile(name) {
  const player = players.find(p => p.name === name);

  if (!player) return;

  alert(
    `PLAYER PROFILE\n\n` +
    `Name: ${player.name}\n` +
    `Tier: ${player.tier}\n` +
    `Region: ${player.region}\n` +
    `Server: ${player.server}\n` +
    `Role: ${player.tester ? 'Tester' : 'Pilot'}`
  );
}

search.addEventListener('input', () => {
  const value = search.value.toLowerCase();

  const filtered = players.filter(player =>
    player.name.toLowerCase().includes(value)
  );

  renderPlayers(filtered);
});

renderPlayers(players);

window.filterTier = filterTier;
window.openProfile = openProfile;
```
