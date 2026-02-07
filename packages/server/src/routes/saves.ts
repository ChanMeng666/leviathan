import { Router } from 'express';
import { eq, and, desc } from 'drizzle-orm';
import { requireAuth } from '../middleware/auth.js';
import { getDb, isDbConfigured } from '../db/index.js';
import { gameSaves, gameRuns } from '../db/schema.js';

const router = Router();

// All saves routes require auth
router.use('/saves', requireAuth);

// List all saves for authenticated user
router.get('/saves', async (req, res) => {
  if (!isDbConfigured()) {
    res.status(503).json({ error: '数据库未配置' });
    return;
  }
  try {
    const db = getDb();
    const saves = await db
      .select({
        id: gameSaves.id,
        slotName: gameSaves.slotName,
        day: gameSaves.day,
        phase: gameSaves.phase,
        gameOver: gameSaves.gameOver,
        nationState: gameSaves.nationState,
        updatedAt: gameSaves.updatedAt,
      })
      .from(gameSaves)
      .where(eq(gameSaves.userId, req.userId!))
      .orderBy(desc(gameSaves.updatedAt));

    // Return lightweight meta (extract nation name from JSONB)
    const meta = saves.map((s) => ({
      id: s.id,
      slotName: s.slotName,
      day: s.day,
      phase: s.phase,
      gameOver: s.gameOver,
      nationName: (s.nationState as any)?.name ?? '未命名',
      updatedAt: s.updatedAt,
    }));

    res.json(meta);
  } catch (err) {
    console.error('Failed to list saves:', err);
    res.status(500).json({ error: '加载存档列表失败' });
  }
});

// Load a specific save
router.get('/saves/:id', async (req, res) => {
  if (!isDbConfigured()) {
    res.status(503).json({ error: '数据库未配置' });
    return;
  }
  try {
    const db = getDb();
    const [save] = await db
      .select()
      .from(gameSaves)
      .where(and(eq(gameSaves.id, req.params.id), eq(gameSaves.userId, req.userId!)));

    if (!save) {
      res.status(404).json({ error: '存档不存在' });
      return;
    }

    res.json({
      id: save.id,
      slotName: save.slotName,
      nation: save.nationState,
      deck: save.deck,
      hand: save.hand,
      discard: save.discard,
      day: save.day,
      phase: save.phase,
      gameOver: save.gameOver,
      gameOverReason: save.gameOverReason,
      eventHistory: save.eventHistory,
      eventCooldowns: save.eventCooldowns,
      narrativeLog: save.narrativeLog,
      scapegoats: save.scapegoats,
      governmentAffinities: save.governmentAffinities,
      discoveredExtended: save.discoveredExtended,
    });
  } catch (err) {
    console.error('Failed to load save:', err);
    res.status(500).json({ error: '加载存档失败' });
  }
});

// Create or update save (upsert by userId + slotName)
router.post('/saves', async (req, res) => {
  if (!isDbConfigured()) {
    res.status(503).json({ error: '数据库未配置' });
    return;
  }
  try {
    const { slotName, nation, deck, hand, discard, day, phase, gameOver, gameOverReason, eventHistory, eventCooldowns, narrativeLog, scapegoats, governmentAffinities, discoveredExtended } = req.body;

    if (!slotName) {
      res.status(400).json({ error: '缺少存档槽名称' });
      return;
    }

    const db = getDb();

    // Check if save exists for this user + slot
    const [existing] = await db
      .select({ id: gameSaves.id })
      .from(gameSaves)
      .where(and(eq(gameSaves.userId, req.userId!), eq(gameSaves.slotName, slotName)));

    if (existing) {
      // Update existing save
      await db
        .update(gameSaves)
        .set({
          nationState: nation,
          deck,
          hand,
          discard,
          day,
          phase,
          gameOver: gameOver ?? false,
          gameOverReason: gameOverReason ?? null,
          eventHistory,
          eventCooldowns,
          narrativeLog,
          scapegoats: scapegoats ?? null,
          governmentAffinities: governmentAffinities ?? null,
          discoveredExtended: discoveredExtended ?? null,
          updatedAt: new Date(),
        } as Partial<typeof gameSaves.$inferInsert>)
        .where(eq(gameSaves.id, existing.id));

      res.json({ id: existing.id, updated: true });
    } else {
      // Create new save
      const [inserted] = await db
        .insert(gameSaves)
        .values({
          userId: req.userId!,
          slotName,
          nationState: nation,
          deck,
          hand,
          discard,
          day,
          phase,
          gameOver: gameOver ?? false,
          gameOverReason: gameOverReason ?? null,
          eventHistory,
          eventCooldowns,
          narrativeLog,
          scapegoats: scapegoats ?? null,
          governmentAffinities: governmentAffinities ?? null,
          discoveredExtended: discoveredExtended ?? null,
        } as typeof gameSaves.$inferInsert)
        .returning({ id: gameSaves.id });

      res.status(201).json({ id: inserted.id, updated: false });
    }
  } catch (err) {
    console.error('Failed to save:', err);
    res.status(500).json({ error: '保存失败' });
  }
});

// Delete a save
router.delete('/saves/:id', async (req, res) => {
  if (!isDbConfigured()) {
    res.status(503).json({ error: '数据库未配置' });
    return;
  }
  try {
    const db = getDb();
    const result = await db
      .delete(gameSaves)
      .where(and(eq(gameSaves.id, req.params.id), eq(gameSaves.userId, req.userId!)))
      .returning({ id: gameSaves.id });

    if (result.length === 0) {
      res.status(404).json({ error: '存档不存在' });
      return;
    }

    res.json({ deleted: true });
  } catch (err) {
    console.error('Failed to delete save:', err);
    res.status(500).json({ error: '删除存档失败' });
  }
});

// Record a completed game run
router.post('/saves/record-run', async (req, res) => {
  if (!isDbConfigured()) {
    res.status(503).json({ error: '数据库未配置' });
    return;
  }
  try {
    const { nationName, daysSurvived, deathReason, governmentType, finalPopulation, epitaph } = req.body;

    const db = getDb();
    const [run] = await db
      .insert(gameRuns)
      .values({
        userId: req.userId!,
        nationName,
        daysSurvived,
        deathReason,
        governmentType,
        finalPopulation,
        epitaph: epitaph ?? null,
      } as typeof gameRuns.$inferInsert)
      .returning({ id: gameRuns.id });

    res.status(201).json({ id: run.id });
  } catch (err) {
    console.error('Failed to record run:', err);
    res.status(500).json({ error: '记录游戏失败' });
  }
});

// Get user's past game runs
router.get('/saves/runs', async (req, res) => {
  if (!isDbConfigured()) {
    res.status(503).json({ error: '数据库未配置' });
    return;
  }
  try {
    const db = getDb();
    const runs = await db
      .select()
      .from(gameRuns)
      .where(eq(gameRuns.userId, req.userId!))
      .orderBy(desc(gameRuns.createdAt));

    res.json(runs);
  } catch (err) {
    console.error('Failed to list runs:', err);
    res.status(500).json({ error: '加载游戏历史失败' });
  }
});

export default router;
