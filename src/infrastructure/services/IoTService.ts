/**
 * IoT Service
 * Device monitoring, data collection, and real-time alerts
 * Supports temperature sensors, humidity monitors, stock counters, etc.
 */

export interface IoTDevice {
  id: string;
  tenantId: string;
  deviceName: string;
  deviceType:
    | 'temperature'
    | 'humidity'
    | 'motion'
    | 'counter'
    | 'camera'
    | 'beacon';
  deviceId: string;
  status: 'online' | 'offline' | 'error';
  lastSeen?: string;
  batteryLevel?: number;
  firmwareVersion?: string;
  location?: string;
  metadata?: any;
}

export interface IoTReading {
  id: string;
  deviceId: string;
  timestamp: string;
  value: number;
  unit: string;
  metadata?: any;
}

export interface IoTAlert {
  id: string;
  deviceId: string;
  alertType:
    | 'threshold_exceeded'
    | 'device_offline'
    | 'battery_low'
    | 'anomaly_detected';
  severity: 'info' | 'warning' | 'critical';
  message: string;
  triggeredAt: string;
  acknowledged: boolean;
}

export class IoTService {
  /**
   * Get mock devices for development
   */
  static getMockDevices(): IoTDevice[] {
    return [
      {
        id: '1',
        tenantId: 'mock-tenant',
        deviceName: 'Depo Sıcaklık Sensörü',
        deviceType: 'temperature',
        deviceId: 'TEMP-001',
        status: 'online',
        lastSeen: new Date(Date.now() - 300000).toISOString(),
        batteryLevel: 85,
        firmwareVersion: '1.2.3',
        location: 'Depo A - Raf 3',
        metadata: {
          minTemp: -20,
          maxTemp: 25,
          alertThreshold: 30,
        },
      },
      {
        id: '2',
        tenantId: 'mock-tenant',
        deviceName: 'Nem Ölçer - Ofis',
        deviceType: 'humidity',
        deviceId: 'HUM-002',
        status: 'online',
        lastSeen: new Date(Date.now() - 120000).toISOString(),
        batteryLevel: 92,
        firmwareVersion: '1.2.3',
        location: 'Ofis - Ana Salon',
        metadata: {
          minHumidity: 30,
          maxHumidity: 70,
        },
      },
      {
        id: '3',
        tenantId: 'mock-tenant',
        deviceName: 'Stok Sayacı - Ürün A',
        deviceType: 'counter',
        deviceId: 'CNT-003',
        status: 'online',
        lastSeen: new Date(Date.now() - 60000).toISOString(),
        batteryLevel: 78,
        firmwareVersion: '2.0.1',
        location: 'Depo B - Bölüm 5',
        metadata: {
          currentCount: 245,
          lowStockThreshold: 50,
        },
      },
      {
        id: '4',
        tenantId: 'mock-tenant',
        deviceName: 'Güvenlik Kamerası 1',
        deviceType: 'camera',
        deviceId: 'CAM-004',
        status: 'offline',
        lastSeen: new Date(Date.now() - 7200000).toISOString(),
        batteryLevel: 0,
        firmwareVersion: '3.1.0',
        location: 'Giriş Kapısı',
        metadata: {
          resolution: '1080p',
          recordingEnabled: true,
        },
      },
    ];
  }

  /**
   * Get mock readings for a device
   */
  static getMockReadings(deviceId: string, hours: number = 24): IoTReading[] {
    const readings: IoTReading[] = [];
    const now = Date.now();
    const interval = (hours * 60 * 60 * 1000) / 50; // 50 data points

    for (let i = 0; i < 50; i++) {
      readings.push({
        id: `reading-${i}`,
        deviceId,
        timestamp: new Date(now - interval * (50 - i)).toISOString(),
        value: 20 + Math.random() * 10, // Random value between 20-30
        unit: '°C',
        metadata: {
          quality: 'good',
          rssi: -50 - Math.random() * 20,
        },
      });
    }

    return readings;
  }

  /**
   * Get mock alerts
   */
  static getMockAlerts(): IoTAlert[] {
    return [
      {
        id: '1',
        deviceId: 'TEMP-001',
        alertType: 'threshold_exceeded',
        severity: 'warning',
        message: 'Sıcaklık eşik değeri aşıldı: 32°C (Eşik: 30°C)',
        triggeredAt: new Date(Date.now() - 1800000).toISOString(),
        acknowledged: false,
      },
      {
        id: '2',
        deviceId: 'CAM-004',
        alertType: 'device_offline',
        severity: 'critical',
        message:
          'Güvenlik Kamerası 1 çevrimdışı - 2 saat boyunca yanıt vermiyor',
        triggeredAt: new Date(Date.now() - 7200000).toISOString(),
        acknowledged: false,
      },
      {
        id: '3',
        deviceId: 'CNT-003',
        alertType: 'battery_low',
        severity: 'warning',
        message: 'Düşük pil seviyesi: %15 kaldı',
        triggeredAt: new Date(Date.now() - 3600000).toISOString(),
        acknowledged: true,
      },
      {
        id: '4',
        deviceId: 'HUM-002',
        alertType: 'anomaly_detected',
        severity: 'info',
        message: 'Nem seviyesinde anormal değişim tespit edildi',
        triggeredAt: new Date(Date.now() - 900000).toISOString(),
        acknowledged: false,
      },
    ];
  }

  /**
   * Send command to device (e.g., reboot, update config)
   */
  static async sendDeviceCommand(
    deviceId: string,
    command: 'reboot' | 'update_firmware' | 'reset_config' | 'calibrate',
    parameters?: any
  ): Promise<boolean> {
    console.log(`Sending command ${command} to device ${deviceId}`, parameters);

    // In production, this would call IoT platform API
    return new Promise(resolve => {
      setTimeout(() => resolve(true), 1000);
    });
  }

  /**
   * Acknowledge alert
   */
  static async acknowledgeAlert(alertId: string): Promise<boolean> {
    console.log(`Acknowledging alert ${alertId}`);

    // In production, update alert status in database
    return new Promise(resolve => {
      setTimeout(() => resolve(true), 500);
    });
  }

  /**
   * Get device health score
   */
  static calculateDeviceHealth(device: IoTDevice): {
    score: number;
    status: 'excellent' | 'good' | 'fair' | 'poor';
    issues: string[];
  } {
    let score = 100;
    const issues: string[] = [];

    // Check online status
    if (device.status === 'offline') {
      score -= 50;
      issues.push('Cihaz çevrimdışı');
    } else if (device.status === 'error') {
      score -= 30;
      issues.push('Cihaz hata durumunda');
    }

    // Check battery level
    if (device.batteryLevel !== undefined) {
      if (device.batteryLevel < 20) {
        score -= 20;
        issues.push(`Düşük pil seviyesi: %${device.batteryLevel}`);
      } else if (device.batteryLevel < 50) {
        score -= 10;
        issues.push(`Orta pil seviyesi: %${device.batteryLevel}`);
      }
    }

    // Check last seen
    if (device.lastSeen) {
      const lastSeenTime = new Date(device.lastSeen).getTime();
      const now = Date.now();
      const hoursSinceLastSeen = (now - lastSeenTime) / (1000 * 60 * 60);

      if (hoursSinceLastSeen > 24) {
        score -= 20;
        issues.push('24 saatten uzun süredir veri alınamıyor');
      } else if (hoursSinceLastSeen > 2) {
        score -= 10;
        issues.push('2 saatten uzun süredir veri alınamıyor');
      }
    }

    // Determine status
    let status: 'excellent' | 'good' | 'fair' | 'poor';
    if (score >= 90) status = 'excellent';
    else if (score >= 70) status = 'good';
    else if (score >= 50) status = 'fair';
    else status = 'poor';

    return { score, status, issues };
  }

  /**
   * Get aggregated statistics for all devices
   */
  static getDeviceStatistics(devices: IoTDevice[]): {
    totalDevices: number;
    onlineDevices: number;
    offlineDevices: number;
    lowBatteryDevices: number;
    averageBatteryLevel: number;
    devicesByType: Record<string, number>;
  } {
    const totalDevices = devices.length;
    const onlineDevices = devices.filter(d => d.status === 'online').length;
    const offlineDevices = devices.filter(d => d.status === 'offline').length;
    const lowBatteryDevices = devices.filter(
      d => d.batteryLevel !== undefined && d.batteryLevel < 20
    ).length;

    const batteryLevels = devices
      .filter(d => d.batteryLevel !== undefined)
      .map(d => d.batteryLevel!);
    const averageBatteryLevel =
      batteryLevels.length > 0
        ? batteryLevels.reduce((sum, level) => sum + level, 0) /
          batteryLevels.length
        : 0;

    const devicesByType = devices.reduce(
      (acc, device) => {
        acc[device.deviceType] = (acc[device.deviceType] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    return {
      totalDevices,
      onlineDevices,
      offlineDevices,
      lowBatteryDevices,
      averageBatteryLevel,
      devicesByType,
    };
  }

  /**
   * Export device data to CSV
   */
  static exportDeviceData(
    devices: IoTDevice[],
    readings: Map<string, IoTReading[]>
  ): string {
    const headers = [
      'Device ID',
      'Device Name',
      'Type',
      'Status',
      'Last Seen',
      'Battery %',
      'Location',
      'Latest Reading',
    ];

    const rows = devices.map(device => {
      const deviceReadings = readings.get(device.id) || [];
      const latestReading = deviceReadings[deviceReadings.length - 1];

      return [
        device.deviceId,
        device.deviceName,
        device.deviceType,
        device.status,
        device.lastSeen || 'N/A',
        device.batteryLevel?.toString() || 'N/A',
        device.location || 'N/A',
        latestReading ? `${latestReading.value} ${latestReading.unit}` : 'N/A',
      ];
    });

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }
}
