const players = [
  const testers = players.filter(p => p.tester).length;
  document.getElementById('testerCount').textContent = testers;
}

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
          <p>${player.plane}</p>
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

  profileModal.classList.remove('hidden');

  profileContent.innerHTML = `
    <h1>✈️ ${player.name}</h1>

    <h2>${player.tier}</h2>

    <p><strong>Plane:</strong> ${player.plane}</p>
    <p><strong>Region:</strong> ${player.region}</p>
    <p><strong>Server:</strong> ${player.server}</p>
    <p><strong>Role:</strong> ${player.tester ? 'Tester' : 'Pilot'}</p>
  `;
}

function closeProfile() {
  profileModal.classList.add('hidden');
}

search.addEventListener('input', () => {
  const value = search.value.toLowerCase();

  const filtered = players.filter(player =>
    player.name.toLowerCase().includes(value)
  );

  renderPlayers(filtered);
});

updateStats();
renderPlayers(players);

window.filterTier = filterTier;
window.openProfile = openProfile;
window.closeProfile = closeProfile;
