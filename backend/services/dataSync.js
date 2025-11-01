const cron = require('node-cron');
const axios = require('axios');
const DistrictSnapshot = require('../models/DistrictSnapshot');
const SyncLog = require('../models/SyncLog');

const API_URL = 'https://api.data.gov.in/resource/ee03643a-ee4c-48c2-ac30-9f2ff26ab722';
const STATE = (process.env.STATE_FILTER || 'ALL').toUpperCase();
const API_KEY = process.env.DATA_GOV_API_KEY;

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

function monthToNumber(m) {
  if (!m) return 0;
  const map = {
    'JAN':1,'FEB':2,'MAR':3,'APR':4,'MAY':5,'JUN':6,'JUL':7,'AUG':8,'SEP':9,'OCT':10,'NOV':11,'DEC':12,
    'JANUARY':1,'FEBRUARY':2,'MARCH':3,'APRIL':4,'MAY':5,'JUNE':6,'JULY':7,'AUGUST':8,'SEPTEMBER':9,'OCTOBER':10,'NOVEMBER':11,'DECEMBER':12
  };
  const key = String(m).trim().toUpperCase();
  return map[key] || parseInt(m, 10) || 0;
}

function finYearToYearMonth(finYear, monthNum) {
  const startYear = parseInt((finYear || '').split('-')[0], 10);
  if (!startYear || !monthNum) return 0;
  const calendarYear = monthNum >= 4 ? startYear : startYear + 1;
  return calendarYear * 100 + monthNum; // yyyymm
}

async function runSyncOnce() {
  const log = new SyncLog({ sync_timestamp: new Date(), status: 'in_progress', state_processed: STATE });
  await log.save();

  if (!API_KEY) {
    log.status = 'failed';
    log.error_message = 'DATA_GOV_API_KEY not set';
    await log.save();
    return;
  }

  try {
    let offset = 0;
    const limit = 1000;
    let totalFetched = 0;
    let page = 0;

    while (true) {
      const stateFilterParam = STATE && STATE !== 'ALL' ? `&filters[state_name]=${encodeURIComponent(STATE)}` : '';
      const url = `${API_URL}?api-key=${API_KEY}&format=json&limit=${limit}&offset=${offset}${stateFilterParam}`;

      let response;
      let attempts = 0;
      const maxAttempts = 4;
      const start = Date.now();
      while (attempts < maxAttempts) {
        try {
          response = await axios.get(url, { timeout: 20000 });
          break;
        } catch (err) {
          attempts++;
          if (attempts >= maxAttempts) throw err;
          await sleep(1500 * Math.pow(2, attempts - 1));
        }
      }
      const apiTime = Date.now() - start;

      if (!response || !response.data || !Array.isArray(response.data.records) || response.data.records.length === 0) break;

      const records = response.data.records;

      const transformed = records.map((r) => {
        const monthRaw = r.month || r.Month || r.MONTH;
        const mnum = monthToNumber(monthRaw);
        const fin = r.fin_year || r.Fin_Year || r.finYear || r.FIN_YEAR;
        const period_key = finYearToYearMonth(fin, mnum);
        return {
          district_code: r.district_code || r.District_Code || r.districtcode,
          state_code: r.state_code || r.State_Code || r.statecode,
          state_name: r.state_name || r.State_Name || r.state,
          district_name: r.district_name || r.District_Name || r.district,
          fin_year: fin,
          month: monthRaw,
          total_households_worked: Number(r.Total_Households_Worked ?? r.total_households_worked ?? r.households_worked ?? 0),
          total_individuals_worked: Number(r.Total_Individuals_Worked ?? r.total_individuals_worked ?? r.individuals_worked ?? 0),
          average_days_employment: Number(r.Average_days_of_employment_provided_per_Household ?? r.average_days_employment ?? 0),
          average_wage_rate: Number(r.Average_Wage_rate_per_day_per_person ?? r.average_wage_rate ?? 0),
          total_expenditure: Number(r.Total_Exp ?? r.total_expenditure ?? 0),
          completed_works: Number(r.Number_of_Completed_Works ?? r.completed_works ?? 0),
          ongoing_works: Number(r.Number_of_Ongoing_Works ?? r.ongoing_works ?? 0),
          sc_persondays: Number(r.SC_persondays ?? r.sc_persondays ?? 0),
          st_persondays: Number(r.ST_persondays ?? r.st_persondays ?? 0),
          women_persondays: Number(r.Women_persondays ?? r.women_persondays ?? 0),
          differently_abled_worked: Number(r.Differently_Abled_Worked ?? r.differently_abled_worked ?? 0),
          households_completed_100_days: Number(r.Households_Completed_100_Days ?? r.households_completed_100_days ?? 0),
          last_updated: new Date(),
          data_source: API_URL,
          period_key
        };
      });

      await DistrictSnapshot.bulkWrite(
        transformed.map((doc) => ({
          updateOne: {
            filter: { district_code: doc.district_code, period_key: doc.period_key },
            update: { $set: doc },
            upsert: true
          }
        }))
      );

      totalFetched += records.length;
      page++;
      await SyncLog.updateOne({ _id: log._id }, { $set: { api_response_time: apiTime } });

      if (records.length < limit) break;
      offset += limit;
      await sleep(1500);
    }

    log.status = 'success';
    log.records_fetched = totalFetched;
    await log.save();
    console.log('Data sync completed:', { totalFetched, state: STATE });
  } catch (err) {
    console.error('Data sync failed:', err.message);
    log.status = 'failed';
    log.error_message = err.message;
    await log.save();
  }
}

function startDataSyncScheduler() {
  cron.schedule('0 */6 * * *', async () => {
    console.log('Starting MGNREGA data sync...');
    await runSyncOnce();
  });
  if ((process.env.RUN_SYNC_ON_START || '').toLowerCase() === 'true') {
    runSyncOnce();
  }
}

module.exports = { startDataSyncScheduler, runSyncOnce };
