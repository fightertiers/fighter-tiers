// API design for future Discord bot integration
//
// When you connect a Discord bot, expose these REST endpoints via a serverless function or Supabase Edge Function:
//
// GET  /api/players          → list all players with their tier assignments
// GET  /api/players/:id      → single player profile
// POST /api/players          → create player { username, country?, uuid? }
// PUT  /api/players/:id      → update player fields
// POST /api/players/:id/tier → assign tier { categoryId, tierId }
// GET  /api/leaderboard      → sorted leaderboard
// GET  /api/categories       → list categories
// GET  /api/tiers            → list all tiers with category
// POST /api/tests            → record a test { playerId, categoryId, tierId, notes? }
//
// Protect write endpoints with an API key header: X-API-Key: <your-bot-secret>
// Store the secret in Supabase Vault or as an environment variable.

export {};
