require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const connectDB = require('./config/database');
const districtsRouter = require('./routes/districts');
const { startDataSyncScheduler } = require('./services/dataSync');

const app = express();
app.set('trust proxy', 1);

const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'https://mgnrega-dashboard-frontend.vercel.app/';
app.use(cors());

app.use(helmet());
app.use(compression());
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 500 });
app.use('/api', limiter);

connectDB();

app.use('/api/districts', districtsRouter);

app.get('/api/system/status', async (req, res) => {
  const SyncLog = require('./models/SyncLog');
  const DistrictSnapshot = require('./models/DistrictSnapshot');
  try {
    const lastSync = await SyncLog.findOne().sort({ sync_timestamp: -1 }).lean();
    const totalRecords = await DistrictSnapshot.estimatedDocumentCount();
    res.json({
      last_sync_timestamp: lastSync ? lastSync.sync_timestamp : null,
      last_sync_status: lastSync ? lastSync.status : null,
      total_records: totalRecords,
      api_status: 'ok'
    });
  } catch (e) {
    res.status(500).json({ error: 'status_failed' });
  }
});

app.use((req, res) => res.status(404).json({ error: 'not_found' }));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'server_error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`API listening on port ${PORT}`);
  startDataSyncScheduler();
});
