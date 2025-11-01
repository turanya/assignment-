import axios from 'axios'

const baseURL = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000/api'
const client = axios.create({ baseURL, timeout: 15000 })

export async function getCurrent(code){ const {data}=await client.get(`/districts/${code}/current`); return data }
export async function getHistory(code){ const {data}=await client.get(`/districts/${code}/history`); return data }
export async function getCompare(code){ const {data}=await client.get(`/districts/${code}/compare`); return data }
export async function searchDistricts(state){ const {data}=await client.get(`/districts/search`, { params: { state } }); return data }
export async function systemStatus(){ const {data}=await client.get(`/system/status`); return data }
export async function getStates(){ const {data}=await client.get(`/districts/states`); return data }
