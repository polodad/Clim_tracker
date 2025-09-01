import { MapManager } from './map-manager';
import { WeatherService } from './weather-service';
import { GeofenceManager } from './geofence-manager';
import { VehicleManager } from './vehicle-manager';
import { AlertManager } from './alert-manager';

// Tipos de datos
export interface WeatherData {
  precipitation: number;
  precipitation_probability: number;
  time: string;
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
}

class ClimaTracker {
  private mapManager: MapManager;
  private weatherService: WeatherService;
  private geofenceManager: GeofenceManager;
  private vehicleManager: VehicleManager;
  private alertManager: AlertManager;
  private config: any;

  constructor() {
    this.mapManager = new MapManager();
    this.weatherService = new WeatherService();
    this.geofenceManager = new GeofenceManager();
    this.vehicleManager = new VehicleManager();
    this.alertManager = new AlertManager();
  }

  async init() {
    try {
      this.showLoading(true);
      
      // Cargar configuración
      await this.loadConfig();
      
      // Inicializar mapa
      await this.mapManager.init();
      
      // Cargar datos
      await this.loadData();
      
      // Configurar eventos
      this.setupEventListeners();
      
      // Iniciar actualizaciones automáticas
      this.startAutoUpdates();
      
      this.showLoading(false);
      console.log('Clima Tracker inicializado correctamente');
    } catch (error) {
      console.error('Error al inicializar Clima Tracker:', error);
      this.showLoading(false);
    }
  }

  private async loadConfig() {
    try {
      const response = await fetch('/data/config.json');
      this.config = await response.json();
    } catch (error) {
      console.error('Error al cargar configuración:', error);
      // Configuración por defecto
      this.config = {
        rain_probability_threshold: 70,
        rain_intensity_mmph: 5,
        radar_distance_km: 10,
        alert_cooldown_min: 30,
        timezone: 'America/Mexico_City'
      };
    }
  }

  private async loadData() {
    try {
      // Cargar geocercas
      await this.geofenceManager.loadGeofences();
      this.geofenceManager.addToMap(this.mapManager.getMap());
      
      // Cargar vehículos
      await this.vehicleManager.loadVehicles();
      this.vehicleManager.addToMap(this.mapManager.getMap());
      
      // Actualizar estado
      this.updateStatus();
    } catch (error) {
      console.error('Error al cargar datos:', error);
    }
  }

  private setupEventListeners() {
    // Toggle radar
    const radarToggle = document.getElementById('radar-toggle') as HTMLInputElement;
    radarToggle.addEventListener('change', (e) => {
      const target = e.target as HTMLInputElement;
      this.mapManager.toggleRadar(target.checked);
    });

    // Toggle geocercas
    const geofencesToggle = document.getElementById('geofences-toggle') as HTMLInputElement;
    geofencesToggle.addEventListener('change', (e) => {
      const target = e.target as HTMLInputElement;
      this.geofenceManager.toggleVisibility(target.checked);
    });

    // Toggle vehículos
    const vehiclesToggle = document.getElementById('vehicles-toggle') as HTMLInputElement;
    vehiclesToggle.addEventListener('change', (e) => {
      const target = e.target as HTMLInputElement;
      this.vehicleManager.toggleVisibility(target.checked);
    });

    // Click en mapa para pronóstico
    this.mapManager.onMapClick(async (lat: number, lng: number) => {
      await this.showForecast(lat, lng);
    });
  }

  private async showForecast(lat: number, lng: number) {
    try {
      const forecast = await this.weatherService.getForecast(lat, lng);
      this.mapManager.showForecastPopup(lat, lng, forecast);
    } catch (error) {
      console.error('Error al obtener pronóstico:', error);
    }
  }

  private updateStatus() {
    // Actualizar estado general
    const activeVehicles = this.vehicleManager.getActiveVehicles().length;
    const geofences = this.geofenceManager.getGeofences().length;
    
    document.getElementById('active-vehicles')!.textContent = activeVehicles.toString();
    document.getElementById('monitored-geofences')!.textContent = geofences.toString();
    
    // Calcular riesgo general
    const riskLevel = this.calculateOverallRisk();
    const riskElement = document.getElementById('overall-risk')!;
    const statusCard = document.getElementById('overall-status')!;
    
    riskElement.textContent = riskLevel.text;
    statusCard.className = `status-card ${riskLevel.class}`;
  }

  private calculateOverallRisk() {
    // Lógica simplificada para calcular riesgo general
    const activeVehicles = this.vehicleManager.getActiveVehicles();
    const geofences = this.geofenceManager.getGeofences();
    
    let highRiskCount = 0;
    let mediumRiskCount = 0;
    
    geofences.forEach(geofence => {
      if (geofence.risk === 'alto') highRiskCount++;
      else if (geofence.risk === 'medio') mediumRiskCount++;
    });
    
    if (highRiskCount > 0) {
      return { text: 'Alto', class: 'danger' };
    } else if (mediumRiskCount > 0) {
      return { text: 'Medio', class: 'warning' };
    } else {
      return { text: 'Bajo', class: '' };
    }
  }

  private startAutoUpdates() {
    // Actualizar cada 5 minutos
    setInterval(async () => {
      try {
        await this.updateWeatherData();
        this.updateStatus();
      } catch (error) {
        console.error('Error en actualización automática:', error);
      }
    }, 5 * 60 * 1000);
  }

  private async updateWeatherData() {
    try {
      // Obtener datos del clima para el centro del mapa
      const center = this.mapManager.getMap().getCenter();
      const weather = await this.weatherService.getCurrentWeather(center.lat, center.lng);
      
      // Actualizar UI
      document.getElementById('current-precipitation')!.textContent = 
        `${weather.precipitation.toFixed(1)} mm/h`;
      document.getElementById('rain-probability')!.textContent = 
        `${weather.precipitation_probability}%`;
      document.getElementById('last-update')!.textContent = 
        new Date().toLocaleTimeString('es-MX');
    } catch (error) {
      console.error('Error al actualizar datos del clima:', error);
    }
  }

  private showLoading(show: boolean) {
    const loading = document.getElementById('loading')!;
    loading.style.display = show ? 'block' : 'none';
  }
}

// Inicializar aplicación
document.addEventListener('DOMContentLoaded', () => {
  const app = new ClimaTracker();
  app.init();
});
