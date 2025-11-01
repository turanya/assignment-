const mongoose = require('mongoose');

const DistrictSnapshotSchema = new mongoose.Schema({
  district_code: { type: String, index: true },
  state_code: { type: String, index: true },
  state_name: { type: String, index: true },
  district_name: { type: String, index: true },
  fin_year: { type: String, index: true },
  month: { type: String, index: true },
  total_households_worked: Number,
  total_individuals_worked: Number,
  average_days_employment: Number,
  average_wage_rate: Number,
  total_expenditure: Number,
  completed_works: Number,
  ongoing_works: Number,
  sc_persondays: Number,
  st_persondays: Number,
  women_persondays: Number,
  differently_abled_worked: Number,
  households_completed_100_days: Number,
  last_updated: { type: Date, default: Date.now },
  data_source: String,
  period_key: { type: Number, index: true }
}, { timestamps: true });

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

DistrictSnapshotSchema.pre('save', function(next) {
  const mnum = monthToNumber(this.month);
  this.period_key = finYearToYearMonth(this.fin_year, mnum);
  next();
});

DistrictSnapshotSchema.index({ district_code: 1, period_key: -1 });
DistrictSnapshotSchema.index({ state_name: 1, period_key: -1 });

module.exports = mongoose.model('DistrictSnapshot', DistrictSnapshotSchema);
