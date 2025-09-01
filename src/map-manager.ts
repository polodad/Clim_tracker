import L from 'leaflet';

export class MapManager {
  private map: L.Map | null = null;
  private radarLayer: L.TileLayer | null = null;
  private radarEnabled = false;
  private onMapClickCallback: ((lat: number, lng: number) => void) | null = null;

  async init() {
    // Crear mapa centrado en México
    this.map = L.map('map').setView([19.4326, -99.1332], 10);

    // Agregar capa base
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    // Configurar click en mapa
    this.map.on('click', (e) => {
      if (this.onMapClickCallback) {
        this.onMapClickCallback(e.latlng.lat, e.latlng.lng);
      }
    });

    // Agregar control de capas
    this.addLayerControl();
  }

  getMap(): L.Map {
    if (!this.map) {
      throw new Error('Mapa no inicializado');
    }
    return this.map;
  }

  toggleRadar(enabled: boolean) {
    this.radarEnabled = enabled;
    
    if (enabled) {
      this.addRadarLayer();
    } else {
      this.removeRadarLayer();
    }
  }

  private addRadarLayer() {
    if (!this.map || this.radarLayer) return;

    // Obtener timestamp más reciente (últimos 10 minutos)
    const now = new Date();
    const timestamp = Math.floor(now.getTime() / 1000);
    
    this.radarLayer = L.tileLayer(
      `https://tilecache.rainviewer.com/v2/radar/${timestamp}/256/{z}/{x}/{y}/2/1_1.png`,
      {
        attribution: '© RainViewer',
        opacity: 0.6,
        zIndex: 1000
      }
    );

    this.radarLayer.addTo(this.map);
  }

  private removeRadarLayer() {
    if (this.radarLayer && this.map) {
      this.map.removeLayer(this.radarLayer);
      this.radarLayer = null;
    }
  }

  onMapClick(callback: (lat: number, lng: number) => void) {
    this.onMapClickCallback = callback;
  }

  showForecastPopup(lat: number, lng: number, forecast: any[]) {
    if (!this.map) return;

    const popupContent = this.createForecastPopup(forecast);
    
    L.popup()
      .setLatLng([lat, lng])
      .setContent(popupContent)
      .openOn(this.map);
  }

  private createForecastPopup(forecast: any[]): string {
    const next3Hours = forecast.slice(0, 3);
    
    let content = `
      <div class="forecast-popup">
        <h4><i class="fas fa-cloud-rain"></i> Pronóstico 3 horas</h4>
    `;
    
    next3Hours.forEach((hour, index) => {
      const time = new Date(hour.time).toLocaleTimeString('es-MX', {
        hour: '2-digit',
        minute: '2-digit'
      });
      
      const riskClass = this.getRiskClass(hour.precipitation, hour.precipitation_probability);
      
      content += `
        <div class="forecast-item">
          <span>${time}</span>
          <span>
            <span class="risk-indicator ${riskClass}"></span>
            ${hour.precipitation.toFixed(1)} mm/h (${hour.precipitation_probability}%)
          </span>
        </div>
      `;
    });
    
    content += '</div>';
    return content;
  }

  private getRiskClass(precipitation: number, probability: number): string {
    if (probability >= 70 && precipitation >= 5) return 'risk-high';
    if (probability >= 50 && precipitation >= 2) return 'risk-medium';
    return 'risk-low';
  }

  private addLayerControl() {
    if (!this.map) return;

    const baseLayers = {
      'OpenStreetMap': L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }),
      'Satélite': L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: '© Esri'
      })
    };

    L.control.layers(baseLayers).addTo(this.map);
  }

  // Método para obtener el centro del mapa
  getCenter(): { lat: number; lng: number } {
    if (!this.map) {
      return { lat: 19.4326, lng: -99.1332 };
    }
    const center = this.map.getCenter();
    return { lat: center.lat, lng: center.lng };
  }
}
