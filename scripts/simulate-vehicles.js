#!/usr/bin/env node

/**
 * Script para simular movimiento de vehículos
 * Útil para testing y demostración del sistema
 */

const fs = require('fs');
const path = require('path');

// Configuración de simulación
const CONFIG = {
  vehiclesFile: path.join(__dirname, '../data/vehicles.json'),
  updateInterval: 30000, // 30 segundos
  movementRange: 0.01, // Rango de movimiento en grados
  centerLat: 19.4326,
  centerLng: -99.1332
};

// Cargar vehículos
function loadVehicles() {
  try {
    const data = fs.readFileSync(CONFIG.vehiclesFile, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error cargando vehículos:', error);
    return null;
  }
}

// Guardar vehículos
function saveVehicles(vehicles) {
  try {
    fs.writeFileSync(CONFIG.vehiclesFile, JSON.stringify(vehicles, null, 2));
    console.log('Vehículos actualizados:', new Date().toISOString());
  } catch (error) {
    console.error('Error guardando vehículos:', error);
  }
}

// Simular movimiento de un vehículo
function simulateMovement(vehicle) {
  if (vehicle.status !== 'active') {
    return vehicle;
  }

  // Movimiento aleatorio pequeño
  const latOffset = (Math.random() - 0.5) * CONFIG.movementRange;
  const lngOffset = (Math.random() - 0.5) * CONFIG.movementRange;

  return {
    ...vehicle,
    lat: Math.max(19.0, Math.min(20.0, vehicle.lat + latOffset)),
    lng: Math.max(-99.5, Math.min(-98.5, vehicle.lng + lngOffset)),
    lastSeen: new Date().toISOString()
  };
}

// Simular cambio de estado ocasional
function simulateStatusChange(vehicle) {
  if (Math.random() < 0.05) { // 5% de probabilidad
    const statuses = ['active', 'maintenance', 'inactive'];
    const currentIndex = statuses.indexOf(vehicle.status);
    const newIndex = (currentIndex + 1) % statuses.length;
    
    return {
      ...vehicle,
      status: statuses[newIndex]
    };
  }
  return vehicle;
}

// Función principal de simulación
function simulate() {
  const vehiclesData = loadVehicles();
  if (!vehiclesData) {
    return;
  }

  // Simular movimiento y cambios de estado
  vehiclesData.vehicles = vehiclesData.vehicles.map(vehicle => {
    let updatedVehicle = simulateMovement(vehicle);
    updatedVehicle = simulateStatusChange(updatedVehicle);
    return updatedVehicle;
  });

  // Guardar cambios
  saveVehicles(vehiclesData);
}

// Ejecutar simulación
console.log('Iniciando simulación de vehículos...');
console.log('Presiona Ctrl+C para detener');

// Ejecutar inmediatamente
simulate();

// Ejecutar cada intervalo
const interval = setInterval(simulate, CONFIG.updateInterval);

// Manejar cierre graceful
process.on('SIGINT', () => {
  console.log('\nDeteniendo simulación...');
  clearInterval(interval);
  process.exit(0);
});

// Manejar errores
process.on('uncaughtException', (error) => {
  console.error('Error no manejado:', error);
  clearInterval(interval);
  process.exit(1);
});
