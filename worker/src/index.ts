// Cloudflare Worker para alertas de Telegram
export interface Env {
  TELEGRAM_BOT_TOKEN: string;
  TELEGRAM_CHAT_ID: string;
  ALERT_CACHE: KVNamespace;
}

export interface Geofence {
  name: string;
  risk: 'alto' | 'medio' | 'bajo';
  description: string;
  coordinates: [number, number][];
}

export interface Vehicle {
  id: string;
  name: string;
  lat: number;
  lng: number;
  lastSeen: string;
  status: 'active' | 'maintenance' | 'inactive';
  driver: string;
}

export interface WeatherData {
  precipitation: number;
  precipitation_probability: number;
  time: string;
}

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

export default {
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    console.log('Ejecutando verificación de alertas...');
    
    try {
      await checkAndSendAlerts(env);
    } catch (error) {
      console.error('Error en verificación de alertas:', error);
    }
  },

  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    
    if (url.pathname === '/test-alert') {
      return await sendTestAlert(env);
    }
    
    if (url.pathname === '/status') {
      return new Response(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }));
    }
    
    return new Response('Clima Tracker Worker', { status: 200 });
  }
};

async function checkAndSendAlerts(env: Env): Promise<void> {
  try {
    // Cargar configuración y datos
    const config = await loadConfig();
    const geofences = await loadGeofences();
    const vehicles = await loadVehicles();
    
    // Verificar condiciones de lluvia para cada geocerca
    for (const geofence of geofences) {
      await checkGeofenceConditions(geofence, config, env);
    }
    
    // Verificar condiciones para vehículos activos
    const activeVehicles = vehicles.filter(v => v.status === 'active');
    for (const vehicle of activeVehicles) {
      await checkVehicleConditions(vehicle, geofences, config, env);
    }
    
    console.log('Verificación de alertas completada');
  } catch (error) {
    console.error('Error en verificación de alertas:', error);
  }
}

async function loadConfig(): Promise<any> {
  try {
    const response = await fetch('https://raw.githubusercontent.com/polodad/clima-tracker/main/data/config.json');
    return await response.json();
  } catch (error) {
    console.error('Error al cargar configuración:', error);
    // Configuración por defecto
    return {
      rain_probability_threshold: 70,
      rain_intensity_mmph: 5,
      radar_distance_km: 10,
      alert_cooldown_min: 30,
      timezone: 'America/Mexico_City'
    };
  }
}

async function loadGeofences(): Promise<Geofence[]> {
  try {
    const response = await fetch('https://raw.githubusercontent.com/polodad/clima-tracker/main/data/geofences.geojson');
    const data = await response.json();
    
    return data.features.map((feature: any) => ({
      name: feature.properties.name,
      risk: feature.properties.risk,
      description: feature.properties.description,
      coordinates: feature.geometry.coordinates[0]
    }));
  } catch (error) {
    console.error('Error al cargar geocercas:', error);
    return [];
  }
}

async function loadVehicles(): Promise<Vehicle[]> {
  try {
    const response = await fetch('https://raw.githubusercontent.com/polodad/clima-tracker/main/data/vehicles.json');
    const data = await response.json();
    return data.vehicles;
  } catch (error) {
    console.error('Error al cargar vehículos:', error);
    return [];
  }
}

async function checkGeofenceConditions(geofence: Geofence, config: any, env: Env): Promise<void> {
  try {
    // Obtener pronóstico para el centroide de la geocerca
    const centroid = calculateCentroid(geofence.coordinates);
    const forecast = await getWeatherForecast(centroid.lat, centroid.lng);
    
    // Verificar condiciones de riesgo en las próximas 2 horas
    const next2Hours = forecast.slice(0, 2);
    const riskConditions = next2Hours.some(hour => 
      hour.precipitation_probability >= config.rain_probability_threshold &&
      hour.precipitation >= config.rain_intensity_mmph
    );
    
    if (riskConditions) {
      const alertKey = `alert_${geofence.name}_rain`;
      const lastAlert = await env.ALERT_CACHE.get(alertKey);
      
      if (!lastAlert || isCooldownExpired(lastAlert, config.alert_cooldown_min)) {
        const alert: Alert = {
          id: `rain_${Date.now()}_${geofence.name}`,
          type: 'rain',
          severity: calculateSeverity(geofence.risk, next2Hours[0]),
          message: `Lluvia intensa inminente en ${geofence.name}. Precipitación: ${next2Hours[0].precipitation.toFixed(1)} mm/h, Probabilidad: ${next2Hours[0].precipitation_probability}%`,
          timestamp: new Date().toISOString(),
          location: { lat: centroid.lat, lng: centroid.lng, name: geofence.name },
          geofence: geofence.name
        };
        
        await sendTelegramAlert(alert, env);
        await env.ALERT_CACHE.put(alertKey, new Date().toISOString());
      }
    }
  } catch (error) {
    console.error(`Error verificando geocerca ${geofence.name}:`, error);
  }
}

async function checkVehicleConditions(vehicle: Vehicle, geofences: Geofence[], config: any, env: Env): Promise<void> {
  try {
    // Verificar si el vehículo está cerca de una geocerca de alto riesgo
    const nearbyGeofences = geofences.filter(geofence => {
      const centroid = calculateCentroid(geofence.coordinates);
      const distance = calculateDistance(vehicle.lat, vehicle.lng, centroid.lat, centroid.lng);
      return distance <= config.radar_distance_km && geofence.risk === 'alto';
    });
    
    if (nearbyGeofences.length > 0) {
      const alertKey = `alert_${vehicle.id}_vehicle`;
      const lastAlert = await env.ALERT_CACHE.get(alertKey);
      
      if (!lastAlert || isCooldownExpired(lastAlert, config.alert_cooldown_min)) {
        const alert: Alert = {
          id: `vehicle_${Date.now()}_${vehicle.id}`,
          type: 'rain',
          severity: 'high',
          message: `Vehículo ${vehicle.name} (${vehicle.driver}) cerca de zona de alto riesgo: ${nearbyGeofences.map(g => g.name).join(', ')}`,
          timestamp: new Date().toISOString(),
          location: { lat: vehicle.lat, lng: vehicle.lng, name: vehicle.name },
          vehicle: vehicle.id
        };
        
        await sendTelegramAlert(alert, env);
        await env.ALERT_CACHE.put(alertKey, new Date().toISOString());
      }
    }
  } catch (error) {
    console.error(`Error verificando vehículo ${vehicle.id}:`, error);
  }
}

async function getWeatherForecast(lat: number, lng: number): Promise<WeatherData[]> {
  try {
    const params = new URLSearchParams({
      latitude: lat.toString(),
      longitude: lng.toString(),
      hourly: 'precipitation,precipitation_probability',
      forecast_hours: '12',
      timezone: 'America/Mexico_City'
    });

    const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);
    const data = await response.json();
    
    const forecast: WeatherData[] = [];
    for (let i = 0; i < 12; i++) {
      forecast.push({
        time: data.hourly.time[i],
        precipitation: data.hourly.precipitation[i] || 0,
        precipitation_probability: data.hourly.precipitation_probability[i] || 0
      });
    }
    
    return forecast;
  } catch (error) {
    console.error('Error al obtener pronóstico:', error);
    return [];
  }
}

function calculateCentroid(coordinates: [number, number][]): { lat: number; lng: number } {
  let lat = 0;
  let lng = 0;
  
  coordinates.forEach(([x, y]) => {
    lat += x;
    lng += y;
  });
  
  return {
    lat: lat / coordinates.length,
    lng: lng / coordinates.length
  };
}

function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Radio de la Tierra en km
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

function calculateSeverity(geofenceRisk: string, weather: WeatherData): 'low' | 'medium' | 'high' {
  if (geofenceRisk === 'alto' && weather.precipitation >= 10) return 'high';
  if (geofenceRisk === 'medio' && weather.precipitation >= 5) return 'medium';
  return 'low';
}

function isCooldownExpired(lastAlertTime: string, cooldownMinutes: number): boolean {
  const lastAlert = new Date(lastAlertTime);
  const now = new Date();
  const diffMinutes = (now.getTime() - lastAlert.getTime()) / (1000 * 60);
  return diffMinutes >= cooldownMinutes;
}

async function sendTelegramAlert(alert: Alert, env: Env): Promise<void> {
  try {
    const message = formatAlertForTelegram(alert);
    
    const response = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: env.TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'Markdown'
      })
    });
    
    if (!response.ok) {
      throw new Error(`Error enviando mensaje a Telegram: ${response.status}`);
    }
    
    console.log(`Alerta enviada: ${alert.id}`);
  } catch (error) {
    console.error('Error enviando alerta a Telegram:', error);
  }
}

function formatAlertForTelegram(alert: Alert): string {
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

async function sendTestAlert(env: Env): Promise<Response> {
  try {
    const testAlert: Alert = {
      id: `test_${Date.now()}`,
      type: 'rain',
      severity: 'medium',
      message: 'Esta es una alerta de prueba del sistema Clima Tracker',
      timestamp: new Date().toISOString(),
      location: { lat: 19.4326, lng: -99.1332, name: 'Ciudad de México' }
    };
    
    await sendTelegramAlert(testAlert, env);
    
    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Alerta de prueba enviada',
      alert: testAlert
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
