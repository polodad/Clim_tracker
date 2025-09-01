export interface Alert {
  id: string;
  type: 'rain' | 'radar' | 'flood';
  severity: 'low' | 'medium' | 'high';
  message: string;
  timestamp: string;
  location: {
    lat: number;
    lng: number;
    name: string;
  };
  geofence?: string;
  vehicle?: string;
}

export class AlertManager {
  private alerts: Alert[] = [];
  private alertHistory: Alert[] = [];

  addAlert(alert: Alert): void {
    // Verificar si ya existe una alerta similar reciente (evitar duplicados)
    const recentAlert = this.alertHistory.find(existing => 
      existing.type === alert.type &&
      existing.location.name === alert.location.name &&
      this.isRecentAlert(existing.timestamp, 30) // 30 minutos
    );

    if (!recentAlert) {
      this.alerts.push(alert);
      this.alertHistory.push(alert);
      
      // Mantener solo las últimas 100 alertas en el historial
      if (this.alertHistory.length > 100) {
        this.alertHistory = this.alertHistory.slice(-100);
      }
      
      console.log('Nueva alerta:', alert);
    }
  }

  private isRecentAlert(timestamp: string, minutes: number): boolean {
    const alertTime = new Date(timestamp);
    const now = new Date();
    const diffMinutes = (now.getTime() - alertTime.getTime()) / (1000 * 60);
    return diffMinutes < minutes;
  }

  getActiveAlerts(): Alert[] {
    return this.alerts.filter(alert => 
      this.isRecentAlert(alert.timestamp, 60) // Alertas activas en la última hora
    );
  }

  getRecentAlerts(limit: number = 10): Alert[] {
    return this.alertHistory
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  clearAlert(alertId: string): void {
    this.alerts = this.alerts.filter(alert => alert.id !== alertId);
  }

  clearAllAlerts(): void {
    this.alerts = [];
  }

  // Método para generar alerta de lluvia intensa
  generateRainAlert(
    geofence: string,
    lat: number,
    lng: number,
    precipitation: number,
    probability: number
  ): Alert {
    const severity = this.calculateRainSeverity(precipitation, probability);
    
    return {
      id: `rain_${Date.now()}_${geofence}`,
      type: 'rain',
      severity,
      message: `Lluvia intensa detectada en ${geofence}. Precipitación: ${precipitation.toFixed(1)} mm/h, Probabilidad: ${probability}%`,
      timestamp: new Date().toISOString(),
      location: { lat, lng, name: geofence },
      geofence
    };
  }

  // Método para generar alerta de radar
  generateRadarAlert(
    location: string,
    lat: number,
    lng: number,
    intensity: number
  ): Alert {
    const severity = this.calculateRadarSeverity(intensity);
    
    return {
      id: `radar_${Date.now()}_${location}`,
      type: 'radar',
      severity,
      message: `Célula de lluvia detectada cerca de ${location}. Intensidad: ${intensity} dBZ`,
      timestamp: new Date().toISOString(),
      location: { lat, lng, name: location }
    };
  }

  // Método para generar alerta de vehículo en riesgo
  generateVehicleAlert(
    vehicle: string,
    lat: number,
    lng: number,
    riskType: string
  ): Alert {
    return {
      id: `vehicle_${Date.now()}_${vehicle}`,
      type: 'rain',
      severity: 'high',
      message: `Vehículo ${vehicle} en zona de riesgo. Tipo: ${riskType}`,
      timestamp: new Date().toISOString(),
      location: { lat, lng, name: vehicle },
      vehicle
    };
  }

  private calculateRainSeverity(precipitation: number, probability: number): 'low' | 'medium' | 'high' {
    if (probability >= 80 && precipitation >= 10) return 'high';
    if (probability >= 60 && precipitation >= 5) return 'medium';
    return 'low';
  }

  private calculateRadarSeverity(intensity: number): 'low' | 'medium' | 'high' {
    if (intensity >= 50) return 'high';
    if (intensity >= 30) return 'medium';
    return 'low';
  }

  // Método para formatear alerta para Telegram
  formatAlertForTelegram(alert: Alert): string {
    const severityEmoji = {
      low: '🟡',
      medium: '🟠',
      high: '🔴'
    };

    const typeEmoji = {
      rain: '🌧️',
      radar: '📡',
      flood: '🌊'
    };

    const timestamp = new Date(alert.timestamp).toLocaleString('es-MX', {
      timeZone: 'America/Mexico_City'
    });

    return `
${severityEmoji[alert.severity]} *ALERTA ${alert.severity.toUpperCase()}*

${typeEmoji[alert.type]} ${alert.message}

📍 *Ubicación:* ${alert.location.name}
🕐 *Hora:* ${timestamp}
🔗 *Ver en mapa:* https://maps.google.com/?q=${alert.location.lat},${alert.location.lng}

---
*Clima Tracker - Sistema de Monitoreo*
    `.trim();
  }

  // Método para obtener estadísticas de alertas
  getAlertStats(): {
    total: number;
    byType: Record<string, number>;
    bySeverity: Record<string, number>;
    last24Hours: number;
  } {
    const last24Hours = this.alertHistory.filter(alert => {
      const alertTime = new Date(alert.timestamp);
      const now = new Date();
      const diffHours = (now.getTime() - alertTime.getTime()) / (1000 * 60 * 60);
      return diffHours <= 24;
    });

    const byType = this.alertHistory.reduce((acc, alert) => {
      acc[alert.type] = (acc[alert.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const bySeverity = this.alertHistory.reduce((acc, alert) => {
      acc[alert.severity] = (acc[alert.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: this.alertHistory.length,
      byType,
      bySeverity,
      last24Hours: last24Hours.length
    };
  }
}
