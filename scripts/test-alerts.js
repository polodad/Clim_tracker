#!/usr/bin/env node

/**
 * Script para probar el sistema de alertas
 * Simula condiciones de riesgo para verificar que las alertas funcionen
 */

const fs = require('fs');
const path = require('path');

// Configuración de prueba
const CONFIG = {
  configFile: path.join(__dirname, '../data/config.json'),
  geofencesFile: path.join(__dirname, '../data/geofences.geojson'),
  vehiclesFile: path.join(__dirname, '../data/vehicles.json'),
  workerUrl: process.env.WORKER_URL || 'https://tu-worker.tu-subdomain.workers.dev'
};

// Cargar configuración
function loadConfig() {
  try {
    const data = fs.readFileSync(CONFIG.configFile, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error cargando configuración:', error);
    return null;
  }
}

// Cargar geocercas
function loadGeofences() {
  try {
    const data = fs.readFileSync(CONFIG.geofencesFile, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error cargando geocercas:', error);
    return null;
  }
}

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

// Probar endpoint de estado del worker
async function testWorkerStatus() {
  try {
    console.log('🔍 Probando estado del worker...');
    const response = await fetch(`${CONFIG.workerUrl}/status`);
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Worker funcionando correctamente');
      console.log('   Estado:', data.status);
      console.log('   Timestamp:', data.timestamp);
    } else {
      console.log('❌ Error en worker:', data);
    }
  } catch (error) {
    console.log('❌ Error conectando al worker:', error.message);
  }
}

// Probar alerta de prueba
async function testAlert() {
  try {
    console.log('🚨 Enviando alerta de prueba...');
    const response = await fetch(`${CONFIG.workerUrl}/test-alert`);
    const data = await response.json();
    
    if (response.ok && data.success) {
      console.log('✅ Alerta de prueba enviada exitosamente');
      console.log('   ID:', data.alert.id);
      console.log('   Tipo:', data.alert.type);
      console.log('   Severidad:', data.alert.severity);
    } else {
      console.log('❌ Error enviando alerta:', data);
    }
  } catch (error) {
    console.log('❌ Error enviando alerta:', error.message);
  }
}

// Verificar configuración
function verifyConfig() {
  console.log('⚙️ Verificando configuración...');
  
  const config = loadConfig();
  if (!config) {
    console.log('❌ No se pudo cargar la configuración');
    return false;
  }

  const geofences = loadGeofences();
  if (!geofences) {
    console.log('❌ No se pudieron cargar las geocercas');
    return false;
  }

  const vehicles = loadVehicles();
  if (!vehicles) {
    console.log('❌ No se pudieron cargar los vehículos');
    return false;
  }

  console.log('✅ Configuración cargada correctamente');
  console.log('   Geocercas:', geofences.features.length);
  console.log('   Vehículos:', vehicles.vehicles.length);
  console.log('   Umbral lluvia:', config.rain_probability_threshold + '%');
  console.log('   Intensidad lluvia:', config.rain_intensity_mmph + ' mm/h');
  console.log('   Distancia radar:', config.radar_distance_km + ' km');
  console.log('   Cooldown alertas:', config.alert_cooldown_min + ' min');

  return true;
}

// Simular condiciones de riesgo
function simulateRiskConditions() {
  console.log('🌧️ Simulando condiciones de riesgo...');
  
  const config = loadConfig();
  if (!config) return;

  // Reducir umbrales temporalmente para forzar alertas
  const originalThreshold = config.rain_probability_threshold;
  const originalIntensity = config.rain_intensity_mmph;

  config.rain_probability_threshold = 10; // Muy bajo para forzar alerta
  config.rain_intensity_mmph = 1; // Muy bajo para forzar alerta

  // Guardar configuración temporal
  try {
    fs.writeFileSync(CONFIG.configFile, JSON.stringify(config, null, 2));
    console.log('✅ Umbrales reducidos temporalmente para testing');
    console.log('   Nuevo umbral:', config.rain_probability_threshold + '%');
    console.log('   Nueva intensidad:', config.rain_intensity_mmph + ' mm/h');
    
    // Restaurar configuración original después de 5 minutos
    setTimeout(() => {
      config.rain_probability_threshold = originalThreshold;
      config.rain_intensity_mmph = originalIntensity;
      fs.writeFileSync(CONFIG.configFile, JSON.stringify(config, null, 2));
      console.log('✅ Configuración restaurada a valores originales');
    }, 5 * 60 * 1000);
    
  } catch (error) {
    console.log('❌ Error modificando configuración:', error.message);
  }
}

// Función principal
async function main() {
  console.log('🧪 Iniciando pruebas del sistema de alertas...\n');

  // Verificar configuración
  if (!verifyConfig()) {
    console.log('❌ No se puede continuar sin configuración válida');
    process.exit(1);
  }

  console.log('');

  // Probar worker
  await testWorkerStatus();
  console.log('');

  // Probar alerta
  await testAlert();
  console.log('');

  // Simular condiciones de riesgo
  simulateRiskConditions();
  console.log('');

  console.log('✅ Pruebas completadas');
  console.log('📱 Revisa tu chat de Telegram para ver las alertas');
  console.log('⏰ Las alertas automáticas se ejecutarán cada 15 minutos');
  console.log('🔄 La configuración se restaurará automáticamente en 5 minutos');
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Error en pruebas:', error);
    process.exit(1);
  });
}

module.exports = {
  testWorkerStatus,
  testAlert,
  verifyConfig,
  simulateRiskConditions
};
