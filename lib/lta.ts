import axios from 'axios';

const BASE = 'https://datamall2.mytransport.sg/ltaodataservice';

export interface BusService {
  ServiceNo: string;
  Operator: string;
  NextBus: BusArrival;
  NextBus2: BusArrival;
  NextBus3: BusArrival;
}

export interface BusArrival {
  OriginCode: string;
  DestinationCode: string;
  EstimatedArrival: string;
  Latitude: string;
  Longitude: string;
  VisitNumber: string;
  Load: 'SEA' | 'SDA' | 'LSD' | '';
  Feature: 'WAB' | '';
  Type: 'SD' | 'DD' | 'BD' | '';
}

export interface BusStop {
  BusStopCode: string;
  RoadName: string;
  Description: string;
  Latitude: number;
  Longitude: number;
}

export interface TrainArrivalStation {
  StationCode: string;
  StationName: string;
  Destination: string;
  Status: string;
  EstArrival: string;
  TrainPlatformCode: string;
}

function makeClient(apiKey: string) {
  return axios.create({
    baseURL: BASE,
    headers: { AccountKey: apiKey },
    timeout: 10000,
  });
}

export async function fetchBusArrivals(
  busStopCode: string,
  apiKey: string
): Promise<BusService[]> {
  const client = makeClient(apiKey);
  const res = await client.get('/v3/BusArrival', {
    params: { BusStopCode: busStopCode },
  });
  return res.data?.Services ?? [];
}

export async function fetchBusStops(
  apiKey: string,
  skip = 0
): Promise<BusStop[]> {
  const client = makeClient(apiKey);
  const res = await client.get('/BusStops', {
    params: { $skip: skip },
  });
  return res.data?.value ?? [];
}

export async function fetchAllBusStops(apiKey: string): Promise<BusStop[]> {
  const client = makeClient(apiKey);
  const all: BusStop[] = [];
  let skip = 0;
  while (true) {
    const res = await client.get('/BusStops', { params: { $skip: skip } });
    const page: BusStop[] = res.data?.value ?? [];
    all.push(...page);
    if (page.length < 500) break;
    skip += 500;
  }
  return all;
}

export async function fetchTrainArrivals(
  apiKey: string
): Promise<TrainArrivalStation[]> {
  const client = makeClient(apiKey);
  const res = await client.get('/v3/TrainArrival');
  return res.data?.value ?? [];
}

// Helpers
export function minsToArrival(isoString: string): number | null {
  if (!isoString) return null;
  const diff = new Date(isoString).getTime() - Date.now();
  return Math.max(0, Math.round(diff / 60000));
}

export function loadLabel(load: BusArrival['Load']): string {
  switch (load) {
    case 'SEA': return 'Seats';
    case 'SDA': return 'Standing';
    case 'LSD': return 'Limited';
    default: return '';
  }
}

export function typeLabel(type: BusArrival['Type']): string {
  switch (type) {
    case 'DD': return 'Double';
    case 'BD': return 'Bendy';
    default: return 'Single';
  }
}
