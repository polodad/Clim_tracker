import L from 'leaflet';

export interface Geofence {
  name: string;
  risk: 'alto' | 'medio' | 'bajo';
  description: string;
  coordinates: [number, number][];
}

export class GeofenceManager {
  private geofences: Geofence[] = [];
  private map: L.Map | null = null;
  private geofenceLayers: L.LayerGroup = new L.LayerGroup();
  private visible = true;

  async loadGeofences(): Promise<void> {
    try {
      const response = await fetch('/data/geofences.geojson');
      const data = await response.json();
      
      this.geofences = data.features.map((feature: any) => ({
        name: feature.properties.name,
        risk: feature.properties.risk,
        description: feature.properties.description,
        coordinates: feature.geometry.coordinates[0]
      }));

      console.log(`Cargadas ${this.geofences.length} geocercas`);
    } catch (error) {
      console.error('Error al cargar geocercas:', error);
      throw error;
    }
  }

  addToMap(map: L.Map): void {
    this.map = map;
    this.geofenceLayers.addTo(map);
    this.renderGeofences();
  }

  private renderGeofences(): void {
    if (!this.map) return;

    this.geofenceLayers.clearLayers();

    this.geofences.forEach(geofence => {
      const polygon = L.polygon(geofence.coordinates, {
        color: this.getRiskColor(geofence.risk),
        weight: 2,
        opacity: 0.8,
        fillColor: this.getRiskColor(geofence.risk),
        fillOpacity: 0.3
      });

      // Agregar popup con información
      const popupContent = `
        <div>
          <h4><i class="fas fa-map-marked-alt"></i> ${geofence.name}</h4>
          <p><strong>Riesgo:</strong> <span class="risk-${geofence.risk}">${geofence.risk.toUpperCase()}</span></p>
          <p><strong>Descripción:</strong> ${geofence.description}</p>
        </div>
      `;

      polygon.bindPopup(popupContent);
      this.geofenceLayers.addLayer(polygon);
    });
  }

  private getRiskColor(risk: 'alto' | 'medio' | 'bajo'): string {
    switch (risk) {
      case 'alto':
        return '#F44336'; // Rojo
      case 'medio':
        return '#FF9800'; // Naranja
      case 'bajo':
        return '#4CAF50'; // Verde
      default:
        return '#2196F3'; // Azul
    }
  }

  toggleVisibility(visible: boolean): void {
    this.visible = visible;
    
    if (visible) {
      this.geofenceLayers.addTo(this.map!);
    } else {
      this.geofenceLayers.remove();
    }
  }

  getGeofences(): Geofence[] {
    return this.geofences;
  }

  getGeofenceByName(name: string): Geofence | undefined {
    return this.geofences.find(g => g.name === name);
  }

  // Método para verificar si un punto está dentro de alguna geocerca
  isPointInGeofence(lat: number, lng: number): Geofence | null {
    for (const geofence of this.geofences) {
      if (this.isPointInPolygon(lat, lng, geofence.coordinates)) {
        return geofence;
      }
    }
    return null;
  }

  // Algoritmo ray casting para verificar si un punto está dentro de un polígono
  private isPointInPolygon(lat: number, lng: number, polygon: [number, number][]): boolean {
    let inside = false;
    
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const [xi, yi] = polygon[i];
      const [xj, yj] = polygon[j];
      
      if (((yi > lng) !== (yj > lng)) && (lat < (xj - xi) * (lng - yi) / (yj - yi) + xi)) {
        inside = !inside;
      }
    }
    
    return inside;
  }

  // Método para obtener geocercas en un radio específico
  getGeofencesInRadius(lat: number, lng: number, radiusKm: number): Geofence[] {
    return this.geofences.filter(geofence => {
      // Calcular distancia al centroide de la geocerca
      const centroid = this.calculateCentroid(geofence.coordinates);
      const distance = this.calculateDistance(lat, lng, centroid.lat, centroid.lng);
      return distance <= radiusKm;
    });
  }

  private calculateCentroid(coordinates: [number, number][]): { lat: number; lng: number } {
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

  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Radio de la Tierra en km
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}
