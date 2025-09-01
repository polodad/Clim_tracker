import L from 'leaflet';

export interface Vehicle {
  id: string;
  name: string;
  lat: number;
  lng: number;
  lastSeen: string;
  status: 'active' | 'maintenance' | 'inactive';
  driver: string;
}

export class VehicleManager {
  private vehicles: Vehicle[] = [];
  private map: L.Map | null = null;
  private vehicleLayers: L.LayerGroup = new L.LayerGroup();
  private visible = true;

  async loadVehicles(): Promise<void> {
    try {
      const response = await fetch('/data/vehicles.json');
      const data = await response.json();
      
      this.vehicles = data.vehicles;
      console.log(`Cargados ${this.vehicles.length} vehículos`);
    } catch (error) {
      console.error('Error al cargar vehículos:', error);
      throw error;
    }
  }

  addToMap(map: L.Map): void {
    this.map = map;
    this.vehicleLayers.addTo(map);
    this.renderVehicles();
  }

  private renderVehicles(): void {
    if (!this.map) return;

    this.vehicleLayers.clearLayers();

    this.vehicles.forEach(vehicle => {
      const icon = this.createVehicleIcon(vehicle.status);
      const marker = L.marker([vehicle.lat, vehicle.lng], { icon });

      // Agregar popup con información del vehículo
      const popupContent = `
        <div>
          <h4><i class="fas fa-truck"></i> ${vehicle.name}</h4>
          <p><strong>ID:</strong> ${vehicle.id}</p>
          <p><strong>Conductor:</strong> ${vehicle.driver}</p>
          <p><strong>Estado:</strong> <span class="status-${vehicle.status}">${this.getStatusText(vehicle.status)}</span></p>
          <p><strong>Última ubicación:</strong> ${new Date(vehicle.lastSeen).toLocaleString('es-MX')}</p>
        </div>
      `;

      marker.bindPopup(popupContent);
      this.vehicleLayers.addLayer(marker);
    });
  }

  private createVehicleIcon(status: string): L.Icon {
    const color = this.getStatusColor(status);
    
    return L.divIcon({
      className: 'vehicle-marker',
      html: `
        <div style="
          background-color: ${color};
          width: 20px;
          height: 20px;
          border-radius: 50%;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 10px;
          font-weight: bold;
        ">
          <i class="fas fa-truck"></i>
        </div>
      `,
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });
  }

  private getStatusColor(status: string): string {
    switch (status) {
      case 'active':
        return '#4CAF50'; // Verde
      case 'maintenance':
        return '#FF9800'; // Naranja
      case 'inactive':
        return '#F44336'; // Rojo
      default:
        return '#2196F3'; // Azul
    }
  }

  private getStatusText(status: string): string {
    switch (status) {
      case 'active':
        return 'Activo';
      case 'maintenance':
        return 'Mantenimiento';
      case 'inactive':
        return 'Inactivo';
      default:
        return 'Desconocido';
    }
  }

  toggleVisibility(visible: boolean): void {
    this.visible = visible;
    
    if (visible) {
      this.vehicleLayers.addTo(this.map!);
    } else {
      this.vehicleLayers.remove();
    }
  }

  getVehicles(): Vehicle[] {
    return this.vehicles;
  }

  getActiveVehicles(): Vehicle[] {
    return this.vehicles.filter(v => v.status === 'active');
  }

  getVehicleById(id: string): Vehicle | undefined {
    return this.vehicles.find(v => v.id === id);
  }

  // Método para actualizar la ubicación de un vehículo
  updateVehicleLocation(id: string, lat: number, lng: number): void {
    const vehicle = this.getVehicleById(id);
    if (vehicle) {
      vehicle.lat = lat;
      vehicle.lng = lng;
      vehicle.lastSeen = new Date().toISOString();
      
      // Re-renderizar si el mapa está visible
      if (this.visible && this.map) {
        this.renderVehicles();
      }
    }
  }

  // Método para obtener vehículos en un radio específico
  getVehiclesInRadius(lat: number, lng: number, radiusKm: number): Vehicle[] {
    return this.vehicles.filter(vehicle => {
      const distance = this.calculateDistance(lat, lng, vehicle.lat, vehicle.lng);
      return distance <= radiusKm;
    });
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

  // Método para simular movimiento de vehículos (para testing)
  simulateVehicleMovement(): void {
    this.vehicles.forEach(vehicle => {
      if (vehicle.status === 'active') {
        // Simular pequeño movimiento aleatorio
        const latOffset = (Math.random() - 0.5) * 0.01;
        const lngOffset = (Math.random() - 0.5) * 0.01;
        
        vehicle.lat += latOffset;
        vehicle.lng += lngOffset;
        vehicle.lastSeen = new Date().toISOString();
      }
    });
    
    // Re-renderizar si es visible
    if (this.visible && this.map) {
      this.renderVehicles();
    }
  }
}
