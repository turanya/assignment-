const axios = require('axios');
const DistrictMetadata = require('../models/DistrictMetadata');
const DistrictSnapshot = require('../models/DistrictSnapshot');

function normalizeIp(ip) {
  if (!ip) return '';
  const raw = (Array.isArray(ip) ? ip[0] : ip).split(',')[0].trim();
  if (raw === '::1' || raw === '127.0.0.1') return '';
  return raw.replace('::ffff:', '');
}

async function detectByIp(ip) {
  try {
    const clientIp = normalizeIp(ip);
    const url = clientIp ? `https://ipapi.co/${clientIp}/json/` : 'https://ipapi.co/json/';
    const { data } = await axios.get(url, { timeout: 8000 });
    const city = data.city || '';
    const region = data.region || data.region_code || '';
    const nameQuery = city || region;
    if (!nameQuery) return null;

    let district = await DistrictMetadata.findOne({
      $or: [
        { district_name: new RegExp(nameQuery, 'i') },
        { district_name: new RegExp(region, 'i') }
      ]
    }).lean();
    if (!district) {
      const snap = await DistrictSnapshot.findOne({
        $or: [
          { district_name: new RegExp(nameQuery, 'i') },
          { district_name: new RegExp(region, 'i') }
        ]
      }).sort({ period_key: -1 }).lean();
      if (!snap) return null;
      return { district_code: snap.district_code, district_name: snap.district_name, state_name: snap.state_name };
    }
    return { district_code: district.district_code, district_name: district.district_name, state_name: district.state_name };
  } catch (e) {
    return null;
  }
}

async function reverseGeocode(latitude, longitude) {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${encodeURIComponent(latitude)}&lon=${encodeURIComponent(longitude)}&format=json`;
    const { data } = await axios.get(url, { headers: { 'User-Agent': 'mgnrega-dashboard/1.0 (contact: dev@example.com)' }, timeout: 8000 });
    const address = data.address || {};
    const districtName = address.county || address.state_district || address.district || '';
    if (!districtName) return null;
    let district = await DistrictMetadata.findOne({ district_name: new RegExp(districtName, 'i') }).lean();
    if (!district) {
      const snap = await DistrictSnapshot.findOne({ district_name: new RegExp(districtName, 'i') }).sort({ period_key: -1 }).lean();
      if (!snap) return null;
      return { district_code: snap.district_code, district_name: snap.district_name, state_name: snap.state_name };
    }
    return { district_code: district.district_code, district_name: district.district_name, state_name: district.state_name };
  } catch (e) {
    return null;
  }
}

module.exports = { detectByIp, reverseGeocode };
