const express = require('express');
const router = express.Router();
const DistrictSnapshot = require('../models/DistrictSnapshot');
const DistrictMetadata = require('../models/DistrictMetadata');

// Simple in-memory cache for hot endpoints
const cache = new Map();
function cacheFor(seconds) {
  return (req, res, next) => {
    const key = req.originalUrl;
    const cached = cache.get(key);
    const now = Date.now();
    if (cached && cached.exp > now) return res.json(cached.data);
    const orig = res.json.bind(res);
    res.json = (data) => {
      cache.set(key, { data, exp: now + seconds * 1000 });
      return orig(data);
    };
    next();
  };
}

// GET /api/districts/:districtCode/current
router.get('/:districtCode/current', cacheFor(30), async (req, res) => {
  try {
    const code = req.params.districtCode;
    const latest = await DistrictSnapshot.findOne({ district_code: code }).sort({ period_key: -1 }).lean();
    if (!latest) return res.status(404).json({ error: 'not_found' });
    const prev = await DistrictSnapshot.findOne({ district_code: code, period_key: { $lt: latest.period_key } }).sort({ period_key: -1 }).lean();

    const diff = (curr, prev) => {
      if (prev == null || curr == null) return null;
      const d = curr - prev;
      const pct = prev ? (d / prev) * 100 : null;
      return { delta: d, pct };
    };

    const comparisons = {
      total_households_worked: diff(latest.total_households_worked, prev?.total_households_worked),
      average_days_employment: diff(latest.average_days_employment, prev?.average_days_employment),
      total_expenditure: diff(latest.total_expenditure, prev?.total_expenditure),
      completed_works: diff(latest.completed_works, prev?.completed_works)
    };

    res.json({ latest, previous: prev || null, comparisons });
  } catch (e) {
    res.status(500).json({ error: 'current_failed' });
  }
});

// GET /api/districts/:districtCode/history
router.get('/:districtCode/history', cacheFor(30), async (req, res) => {
  try {
    const code = req.params.districtCode;
    const docs = await DistrictSnapshot.find({ district_code: code }).sort({ period_key: -1 }).limit(12).lean();
    if (!docs.length) return res.json({ history: [] });
    const history = docs.slice().reverse();

    const trend = (key) => {
      if (history.length < 2) return 'stable';
      const a = Number(history[history.length - 2][key] || 0);
      const b = Number(history[history.length - 1][key] || 0);
      if (b > a) return 'improving';
      if (b < a) return 'declining';
      return 'stable';
    };

    res.json({
      history,
      trends: {
        total_households_worked: trend('total_households_worked'),
        total_expenditure: trend('total_expenditure')
      }
    });
  } catch (e) {
    res.status(500).json({ error: 'history_failed' });
  }
});

// GET /api/districts/:districtCode/compare
router.get('/:districtCode/compare', cacheFor(60), async (req, res) => {
  try {
    const code = req.params.districtCode;
    const latest = await DistrictSnapshot.findOne({ district_code: code }).sort({ period_key: -1 }).lean();
    if (!latest) return res.status(404).json({ error: 'not_found' });

    // State averages at the same period
    const [stateAgg] = await DistrictSnapshot.aggregate([
      { $match: { state_name: latest.state_name, period_key: latest.period_key } },
      { $group: {
          _id: null,
          avg_households: { $avg: '$total_households_worked' },
          avg_days: { $avg: '$average_days_employment' },
          avg_expenditure: { $avg: '$total_expenditure' },
          avg_completed: { $avg: '$completed_works' }
        }
      }
    ]);

    const pctDiff = (a, b) => (b ? ((a - b) / b) * 100 : null);
    const state_compare = stateAgg ? {
      total_households_worked: pctDiff(latest.total_households_worked || 0, stateAgg.avg_households || 0),
      average_days_employment: pctDiff(latest.average_days_employment || 0, stateAgg.avg_days || 0),
      total_expenditure: pctDiff(latest.total_expenditure || 0, stateAgg.avg_expenditure || 0),
      completed_works: pctDiff(latest.completed_works || 0, stateAgg.avg_completed || 0)
    } : null;

    // Similar districts by rural population
    const selfMeta = await DistrictMetadata.findOne({ district_code: code }).lean();
    let similar = [];
    if (selfMeta && selfMeta.rural_population) {
      const around = await DistrictMetadata.find({
        state_name: selfMeta.state_name,
        district_code: { $ne: code },
        rural_population: { $exists: true }
      }).lean();
      around.sort((a, b) => Math.abs((a.rural_population || 0) - selfMeta.rural_population) - Math.abs((b.rural_population || 0) - selfMeta.rural_population));
      similar = around.slice(0, 3);
    }

    // Fetch their latest for same period and compute diffs
    const codes = similar.map(s => s.district_code);
    const peers = codes.length ? await DistrictSnapshot.find({ district_code: { $in: codes }, period_key: latest.period_key }).lean() : [];

    const peer_compare = peers.map(p => ({
      district_code: p.district_code,
      district_name: similar.find(s => s.district_code === p.district_code)?.district_name,
      diffs: {
        total_households_worked: pctDiff((latest.total_households_worked || 0), (p.total_households_worked || 0)),
        average_days_employment: pctDiff((latest.average_days_employment || 0), (p.average_days_employment || 0)),
        total_expenditure: pctDiff((latest.total_expenditure || 0), (p.total_expenditure || 0)),
        completed_works: pctDiff((latest.completed_works || 0), (p.completed_works || 0))
      }
    }));

    // Top 5 districts by households worked in the same period (state leaderboard)
    const top_districts = await DistrictSnapshot.aggregate([
      { $match: { state_name: latest.state_name, period_key: latest.period_key } },
      { $sort: { total_households_worked: -1 } },
      { $limit: 5 },
      { $project: { _id: 0, district_code: 1, district_name: 1, total_households_worked: 1 } }
    ]);

    res.json({ state_compare, peer_compare, top_districts });
  } catch (e) {
    res.status(500).json({ error: 'compare_failed' });
  }
});

// GET /api/districts/search?state=ODISHA
router.get('/search', cacheFor(300), async (req, res) => {
  try {
    const state = String(req.query.state || '').trim();
    const q = state ? { state_name: new RegExp(`^${state}$`, 'i') } : {};
    let list = await DistrictMetadata.find(q).sort({ state_name: 1, district_name: 1 }).lean();
    if (!list.length) {
      // Fallback to snapshots distinct values
      const match = state ? { state_name: new RegExp(`^${state}$`, 'i') } : {};
      const agg = await DistrictSnapshot.aggregate([
        { $match: match },
        { $sort: { period_key: -1 } },
        { $group: {
            _id: '$district_code',
            district_code: { $first: '$district_code' },
            district_name: { $first: '$district_name' },
            state_name: { $first: '$state_name' }
        } },
        { $sort: { state_name: 1, district_name: 1 } }
      ]);
      list = agg;
    }
    res.json(list.map(d => ({
      district_code: d.district_code,
      district_name: d.district_name,
      state_name: d.state_name,
      latitude: d.latitude,
      longitude: d.longitude,
      population: d.population,
      rural_population: d.rural_population,
      total_gram_panchayats: d.total_gram_panchayats
    })));
  } catch (e) {
    res.status(500).json({ error: 'search_failed' });
  }
});

// GET /api/districts/states
router.get('/states', cacheFor(600), async (req, res) => {
  try {
    let states = await DistrictMetadata.distinct('state_name');
    if (!states || states.length === 0) {
      states = await DistrictSnapshot.distinct('state_name');
    }
    states = (states || []).filter(Boolean).sort((a,b)=> String(a).localeCompare(String(b)));
    res.json(states);
  } catch (e) {
    res.status(500).json({ error: 'states_failed' });
  }
});

module.exports = router;
 
