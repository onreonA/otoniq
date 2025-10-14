/**
 * IoT Mock Data
 * Warehouse sensors, real-time monitoring, and alert data
 */

import { format, subMinutes, subHours } from 'date-fns';

// --- Types ---
export interface Sensor {
  id: string;
  name: string;
  type: 'temperature' | 'humidity' | 'motion' | 'door' | 'stock' | 'energy';
  location: string;
  status: 'online' | 'offline' | 'warning';
  currentValue: number;
  unit: string;
  minThreshold: number;
  maxThreshold: number;
  lastUpdate: string;
  battery: number; // percentage
}

export interface SensorReading {
  timestamp: string;
  value: number;
}

export interface Alert {
  id: string;
  sensorId: string;
  sensorName: string;
  type: 'critical' | 'warning' | 'info';
  message: string;
  timestamp: string;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
}

export interface WarehouseZone {
  id: string;
  name: string;
  sensors: string[]; // sensor IDs
  temperature: number;
  humidity: number;
  occupancy: number; // percentage
  status: 'normal' | 'warning' | 'critical';
}

// --- Mock Sensors ---
export const mockSensors: Sensor[] = [
  {
    id: 'SENSOR001',
    name: 'Depo A - Sıcaklık',
    type: 'temperature',
    location: 'Depo A - Raf 1',
    status: 'online',
    currentValue: 22.5,
    unit: '°C',
    minThreshold: 18,
    maxThreshold: 25,
    lastUpdate: subMinutes(new Date(), 2).toISOString(),
    battery: 85,
  },
  {
    id: 'SENSOR002',
    name: 'Depo A - Nem',
    type: 'humidity',
    location: 'Depo A - Raf 1',
    status: 'online',
    currentValue: 65,
    unit: '%',
    minThreshold: 40,
    maxThreshold: 70,
    lastUpdate: subMinutes(new Date(), 3).toISOString(),
    battery: 78,
  },
  {
    id: 'SENSOR003',
    name: 'Depo B - Sıcaklık',
    type: 'temperature',
    location: 'Depo B - Raf 3',
    status: 'warning',
    currentValue: 28.3,
    unit: '°C',
    minThreshold: 18,
    maxThreshold: 25,
    lastUpdate: subMinutes(new Date(), 1).toISOString(),
    battery: 92,
  },
  {
    id: 'SENSOR004',
    name: 'Giriş Kapısı',
    type: 'door',
    location: 'Ana Giriş',
    status: 'online',
    currentValue: 0, // 0 = closed, 1 = open
    unit: '',
    minThreshold: 0,
    maxThreshold: 1,
    lastUpdate: subMinutes(new Date(), 5).toISOString(),
    battery: 95,
  },
  {
    id: 'SENSOR005',
    name: 'Hareket Sensörü 1',
    type: 'motion',
    location: 'Depo C - Koridor',
    status: 'online',
    currentValue: 1, // 0 = no motion, 1 = motion detected
    unit: '',
    minThreshold: 0,
    maxThreshold: 1,
    lastUpdate: subMinutes(new Date(), 1).toISOString(),
    battery: 68,
  },
  {
    id: 'SENSOR006',
    name: 'Stok Seviye Sensörü',
    type: 'stock',
    location: 'Depo A - Raf 2',
    status: 'online',
    currentValue: 75,
    unit: '%',
    minThreshold: 20,
    maxThreshold: 100,
    lastUpdate: subMinutes(new Date(), 10).toISOString(),
    battery: 88,
  },
  {
    id: 'SENSOR007',
    name: 'Enerji Tüketimi',
    type: 'energy',
    location: 'Ana Elektrik Panosu',
    status: 'online',
    currentValue: 4.2,
    unit: 'kW',
    minThreshold: 0,
    maxThreshold: 10,
    lastUpdate: subMinutes(new Date(), 1).toISOString(),
    battery: 100, // AC powered
  },
  {
    id: 'SENSOR008',
    name: 'Depo C - Sıcaklık',
    type: 'temperature',
    location: 'Depo C - Soğuk Hücre',
    status: 'offline',
    currentValue: 0,
    unit: '°C',
    minThreshold: 2,
    maxThreshold: 8,
    lastUpdate: subHours(new Date(), 2).toISOString(),
    battery: 15,
  },
];

// --- Mock Sensor Readings (Time Series) ---
export const generateSensorReadings = (
  sensorId: string,
  minutes: number = 60
): SensorReading[] => {
  const readings: SensorReading[] = [];
  const sensor = mockSensors.find(s => s.id === sensorId);
  if (!sensor) return readings;

  const baseValue = sensor.currentValue;
  const now = new Date();

  for (let i = minutes; i >= 0; i--) {
    const timestamp = subMinutes(now, i);
    const variance = (Math.random() - 0.5) * 2; // Random variance
    const value = Math.max(
      sensor.minThreshold - 5,
      Math.min(sensor.maxThreshold + 5, baseValue + variance)
    );

    readings.push({
      timestamp: timestamp.toISOString(),
      value: parseFloat(value.toFixed(2)),
    });
  }

  return readings;
};

// --- Mock Alerts ---
export const mockAlerts: Alert[] = [
  {
    id: 'ALERT001',
    sensorId: 'SENSOR003',
    sensorName: 'Depo B - Sıcaklık',
    type: 'warning',
    message: 'Sıcaklık eşik değeri aşıldı: 28.3°C (max: 25°C)',
    timestamp: subMinutes(new Date(), 15).toISOString(),
    acknowledged: false,
  },
  {
    id: 'ALERT002',
    sensorId: 'SENSOR008',
    sensorName: 'Depo C - Sıcaklık',
    type: 'critical',
    message: 'Sensör çevrimdışı - 2 saat yanıt yok',
    timestamp: subHours(new Date(), 2).toISOString(),
    acknowledged: false,
  },
  {
    id: 'ALERT003',
    sensorId: 'SENSOR005',
    sensorName: 'Hareket Sensörü 1',
    type: 'info',
    message: 'Mesai dışı hareket tespit edildi',
    timestamp: subMinutes(new Date(), 45).toISOString(),
    acknowledged: true,
    acknowledgedBy: 'Güvenlik Görevlisi',
    acknowledgedAt: subMinutes(new Date(), 30).toISOString(),
  },
  {
    id: 'ALERT004',
    sensorId: 'SENSOR006',
    sensorName: 'Stok Seviye Sensörü',
    type: 'warning',
    message: 'Stok seviyesi %75 - Yeniden sipariş gerekebilir',
    timestamp: subHours(new Date(), 1).toISOString(),
    acknowledged: false,
  },
];

// --- Mock Warehouse Zones ---
export const mockWarehouseZones: WarehouseZone[] = [
  {
    id: 'ZONE001',
    name: 'Depo A',
    sensors: ['SENSOR001', 'SENSOR002', 'SENSOR006'],
    temperature: 22.5,
    humidity: 65,
    occupancy: 78,
    status: 'normal',
  },
  {
    id: 'ZONE002',
    name: 'Depo B',
    sensors: ['SENSOR003'],
    temperature: 28.3,
    humidity: 58,
    occupancy: 92,
    status: 'warning',
  },
  {
    id: 'ZONE003',
    name: 'Depo C - Soğuk Hücre',
    sensors: ['SENSOR008'],
    temperature: 0,
    humidity: 0,
    occupancy: 45,
    status: 'critical',
  },
  {
    id: 'ZONE004',
    name: 'Giriş & Koridor',
    sensors: ['SENSOR004', 'SENSOR005'],
    temperature: 24,
    humidity: 55,
    occupancy: 15,
    status: 'normal',
  },
];

// --- Helper Functions ---
export const getOnlineSensors = () =>
  mockSensors.filter(s => s.status === 'online');

export const getWarningSensors = () =>
  mockSensors.filter(s => s.status === 'warning');

export const getOfflineSensors = () =>
  mockSensors.filter(s => s.status === 'offline');

export const getUnacknowledgedAlerts = () =>
  mockAlerts.filter(a => !a.acknowledged);

export const getCriticalAlerts = () =>
  mockAlerts.filter(a => a.type === 'critical' && !a.acknowledged);

export const getSensorsByType = (type: Sensor['type']) =>
  mockSensors.filter(s => s.type === type);

export const getLowBatterySensors = () =>
  mockSensors.filter(s => s.battery < 20 && s.battery < 100);
