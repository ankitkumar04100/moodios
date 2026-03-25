/**
 * DuckDB-Wasm local analytics store.
 * Stores minute-level emotion aggregates entirely in-browser.
 * Supports queries and CSV export.
 */

import * as duckdb from '@duckdb/duckdb-wasm';

let db: duckdb.AsyncDuckDB | null = null;
let conn: duckdb.AsyncDuckDBConnection | null = null;
let initPromise: Promise<void> | null = null;

async function initDB(): Promise<void> {
  if (db) return;

  const JSDELIVR_BUNDLES = duckdb.getJsDelivrBundles();

  const bundle = await duckdb.selectBundle(JSDELIVR_BUNDLES);

  const worker_url = URL.createObjectURL(
    new Blob([`importScripts("${bundle.mainWorker!}");`], { type: 'text/javascript' })
  );

  const worker = new Worker(worker_url);
  const logger = new duckdb.ConsoleLogger();
  db = new duckdb.AsyncDuckDB(logger, worker);
  await db.instantiate(bundle.mainModule, bundle.pthreadWorker);
  URL.revokeObjectURL(worker_url);

  conn = await db.connect();

  // Create the aggregates table
  await conn.query(`
    CREATE TABLE IF NOT EXISTS emotion_minutes (
      ts_minute TIMESTAMP NOT NULL,
      mood VARCHAR NOT NULL,
      stress_avg DOUBLE NOT NULL,
      energy_avg DOUBLE NOT NULL,
      confidence_avg DOUBLE NOT NULL,
      sample_count INTEGER NOT NULL,
      source VARCHAR DEFAULT 'simulation'
    );
  `);
}

function ensureInit(): Promise<void> {
  if (!initPromise) {
    initPromise = initDB().catch((err) => {
      console.warn('DuckDB-Wasm init failed, analytics unavailable:', err);
      initPromise = null;
    });
  }
  return initPromise;
}

// Batch buffer for aggregation
interface SampleBatch {
  mood: string;
  stress: number;
  energy: number;
  confidence: number;
  source: string;
}

let currentBatch: SampleBatch[] = [];
let lastFlush = 0;

export async function pushSample(
  mood: string,
  stress: number,
  energy: number,
  confidence: number,
  source: string = 'simulation'
): Promise<void> {
  currentBatch.push({ mood, stress, energy, confidence, source });

  // Flush every 60 seconds (minute-level aggregation)
  const now = Date.now();
  if (now - lastFlush >= 60_000 && currentBatch.length > 0) {
    await flushBatch();
  }
}

export async function flushBatch(): Promise<void> {
  if (currentBatch.length === 0) return;

  await ensureInit();
  if (!conn) return;

  const batch = [...currentBatch];
  currentBatch = [];
  lastFlush = Date.now();

  // Aggregate the batch
  const moodCounts: Record<string, number> = {};
  let stressSum = 0, energySum = 0, confSum = 0;
  let source = 'simulation';

  for (const s of batch) {
    moodCounts[s.mood] = (moodCounts[s.mood] || 0) + 1;
    stressSum += s.stress;
    energySum += s.energy;
    confSum += s.confidence;
    if (s.source === 'real') source = 'real';
  }

  const dominantMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'neutral';
  const n = batch.length;
  const tsMinute = new Date();
  tsMinute.setSeconds(0, 0);

  try {
    await conn.query(`
      INSERT INTO emotion_minutes VALUES (
        '${tsMinute.toISOString()}'::TIMESTAMP,
        '${dominantMood}',
        ${(stressSum / n).toFixed(4)},
        ${(energySum / n).toFixed(4)},
        ${(confSum / n).toFixed(4)},
        ${n},
        '${source}'
      );
    `);
  } catch (err) {
    console.warn('DuckDB insert failed:', err);
  }
}

export interface MinuteAggregate {
  ts_minute: string;
  mood: string;
  stress_avg: number;
  energy_avg: number;
  confidence_avg: number;
  sample_count: number;
  source: string;
}

export async function queryTimeline(limit = 1440): Promise<MinuteAggregate[]> {
  await ensureInit();
  if (!conn) return [];

  try {
    const result = await conn.query(`
      SELECT * FROM emotion_minutes
      ORDER BY ts_minute DESC
      LIMIT ${limit}
    `);

    const rows: MinuteAggregate[] = [];
    for (let i = 0; i < result.numRows; i++) {
      // DuckDB returns timestamps as BigInt microseconds — convert to ISO string
      const rawTs = result.getChildAt(0)?.get(i);
      let tsStr: string;
      if (typeof rawTs === 'bigint') {
        tsStr = new Date(Number(rawTs) / 1000).toISOString();
      } else if (typeof rawTs === 'number') {
        tsStr = new Date(rawTs > 1e12 ? rawTs / 1000 : rawTs).toISOString();
      } else {
        tsStr = new Date(String(rawTs)).toISOString();
      }
      if (tsStr === 'Invalid Date') tsStr = new Date().toISOString();

      rows.push({
        ts_minute: tsStr,
        mood: String(result.getChildAt(1)?.get(i)),
        stress_avg: Number(result.getChildAt(2)?.get(i)),
        energy_avg: Number(result.getChildAt(3)?.get(i)),
        confidence_avg: Number(result.getChildAt(4)?.get(i)),
        sample_count: Number(result.getChildAt(5)?.get(i)),
        source: String(result.getChildAt(6)?.get(i)),
      });
    }

    return rows.reverse();
  } catch (err) {
    console.warn('DuckDB query failed:', err);
    return [];
  }
}

export async function getStats(): Promise<{
  totalMinutes: number;
  avgStress: number;
  avgEnergy: number;
  topMood: string;
} | null> {
  await ensureInit();
  if (!conn) return null;

  try {
    const result = await conn.query(`
      SELECT
        COUNT(*) as total,
        AVG(stress_avg) as avg_stress,
        AVG(energy_avg) as avg_energy,
        MODE(mood) as top_mood
      FROM emotion_minutes
    `);

    if (result.numRows === 0) return null;

    return {
      totalMinutes: Number(result.getChildAt(0)?.get(0)) || 0,
      avgStress: Number(result.getChildAt(1)?.get(0)) || 0,
      avgEnergy: Number(result.getChildAt(2)?.get(0)) || 0,
      topMood: String(result.getChildAt(3)?.get(0)) || 'neutral',
    };
  } catch {
    return null;
  }
}

export async function exportCSV(): Promise<string> {
  await ensureInit();
  if (!conn) return '';

  try {
    const result = await conn.query(`
      SELECT * FROM emotion_minutes ORDER BY ts_minute ASC
    `);

    const header = 'ts_minute,mood,stress_avg,energy_avg,confidence_avg,sample_count,source\n';
    const rows: string[] = [];

    for (let i = 0; i < result.numRows; i++) {
      rows.push([
        result.getChildAt(0)?.get(i),
        result.getChildAt(1)?.get(i),
        Number(result.getChildAt(2)?.get(i)).toFixed(4),
        Number(result.getChildAt(3)?.get(i)).toFixed(4),
        Number(result.getChildAt(4)?.get(i)).toFixed(4),
        result.getChildAt(5)?.get(i),
        result.getChildAt(6)?.get(i),
      ].join(','));
    }

    return header + rows.join('\n');
  } catch {
    return '';
  }
}
