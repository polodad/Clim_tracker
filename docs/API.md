# Documentación de APIs - Clima Tracker

Esta documentación describe las APIs utilizadas en el sistema Clima Tracker.

## 🌤️ Open-Meteo API

### Descripción
API gratuita de pronóstico meteorológico que proporciona datos de precipitación y probabilidad de lluvia.

### Endpoint Base
```
https://api.open-meteo.com/v1/forecast
```

### Parámetros

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `latitude` | float | Sí | Latitud de la ubicación |
| `longitude` | float | Sí | Longitud de la ubicación |
| `hourly` | string | Sí | Variables meteorológicas (precipitation,precipitation_probability) |
| `forecast_hours` | integer | No | Número de horas a pronosticar (default: 24) |
| `timezone` | string | No | Zona horaria (default: auto) |

### Ejemplo de Uso

```javascript
const params = new URLSearchParams({
  latitude: '19.4326',
  longitude: '-99.1332',
  hourly: 'precipitation,precipitation_probability',
  forecast_hours: '12',
  timezone: 'America/Mexico_City'
});

const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);
const data = await response.json();
```

### Respuesta

```json
{
  "hourly": {
    "time": [
      "2024-01-15T00:00",
      "2024-01-15T01:00",
      "2024-01-15T02:00"
    ],
    "precipitation": [0.0, 0.5, 1.2],
    "precipitation_probability": [0, 25, 60]
  }
}
```

### Límites
- **Gratuito:** 10,000 requests/día
- **Rate Limit:** 100 requests/minuto
- **Sin autenticación requerida**

## 📡 RainViewer API

### Descripción
API para obtener imágenes de radar meteorológico en tiempo real.

### Endpoint Base
```
https://tilecache.rainviewer.com/v2/radar/{timestamp}/256/{z}/{x}/{y}/2/1_1.png
```

### Parámetros

| Parámetro | Descripción |
|-----------|-------------|
| `timestamp` | Timestamp Unix del frame de radar |
| `z` | Nivel de zoom (0-18) |
| `x` | Coordenada X del tile |
| `y` | Coordenada Y del tile |

### Obtener Timestamps Disponibles

```javascript
const response = await fetch('https://api.rainviewer.com/public/weather-maps.json');
const data = await response.json();

// Obtener el timestamp más reciente
const latestTimestamp = data.radar.past[data.radar.past.length - 1];
```

### Ejemplo de Uso

```javascript
// Obtener tile de radar para coordenadas específicas
const timestamp = 1705320000; // Timestamp Unix
const z = 10; // Nivel de zoom
const x = 512; // Coordenada X
const y = 384; // Coordenada Y

const tileUrl = `https://tilecache.rainviewer.com/v2/radar/${timestamp}/256/${z}/${x}/${y}/2/1_1.png`;
```

### Límites
- **Sin límites conocidos**
- **Sin autenticación requerida**
- **Disponible 24/7**

## 🤖 Telegram Bot API

### Descripción
API para enviar mensajes de alerta a través de Telegram.

### Endpoint Base
```
https://api.telegram.org/bot{token}/{method}
```

### Métodos Utilizados

#### Enviar Mensaje
```
POST https://api.telegram.org/bot{token}/sendMessage
```

**Parámetros:**
```json
{
  "chat_id": "string",
  "text": "string",
  "parse_mode": "Markdown"
}
```

**Ejemplo:**
```javascript
const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    chat_id: CHAT_ID,
    text: '🌧️ *ALERTA ALTA*\n\nLluvia intensa detectada...',
    parse_mode: 'Markdown'
  })
});
```

#### Obtener Updates
```
GET https://api.telegram.org/bot{token}/getUpdates
```

**Respuesta:**
```json
{
  "ok": true,
  "result": [
    {
      "update_id": 123456789,
      "message": {
        "message_id": 1,
        "from": {
          "id": 123456789,
          "is_bot": false,
          "first_name": "Usuario"
        },
        "chat": {
          "id": 123456789,
          "first_name": "Usuario",
          "type": "private"
        },
        "date": 1705320000,
        "text": "Hola"
      }
    }
  ]
}
```

### Límites
- **30 mensajes/segundo por bot**
- **20 mensajes/minuto por chat**
- **Requiere autenticación (BOT_TOKEN)**

## 🔧 Cloudflare Workers API

### Descripción
API personalizada del worker para gestionar alertas y monitoreo.

### Endpoints

#### Estado del Worker
```
GET https://tu-worker.tu-subdomain.workers.dev/status
```

**Respuesta:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

#### Alerta de Prueba
```
GET https://tu-worker.tu-subdomain.workers.dev/test-alert
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Alerta de prueba enviada",
  "alert": {
    "id": "test_1705320000",
    "type": "rain",
    "severity": "medium",
    "message": "Esta es una alerta de prueba del sistema Clima Tracker",
    "timestamp": "2024-01-15T10:30:00.000Z",
    "location": {
      "lat": 19.4326,
      "lng": -99.1332,
      "name": "Ciudad de México"
    }
  }
}
```

## 📊 Estructura de Datos

### Geocerca (GeoJSON)
```json
{
  "type": "Feature",
  "properties": {
    "name": "string",
    "risk": "alto|medio|bajo",
    "description": "string"
  },
  "geometry": {
    "type": "Polygon",
    "coordinates": [[[lng, lat], [lng, lat], ...]]
  }
}
```

### Vehículo
```json
{
  "id": "string",
  "name": "string",
  "lat": "number",
  "lng": "number",
  "lastSeen": "ISO 8601 string",
  "status": "active|maintenance|inactive",
  "driver": "string"
}
```

### Alerta
```json
{
  "id": "string",
  "type": "rain|radar|flood",
  "severity": "low|medium|high",
  "message": "string",
  "timestamp": "ISO 8601 string",
  "location": {
    "lat": "number",
    "lng": "number",
    "name": "string"
  },
  "geofence": "string (opcional)",
  "vehicle": "string (opcional)"
}
```

## 🚨 Códigos de Error

### Open-Meteo
- **400:** Parámetros inválidos
- **429:** Rate limit excedido
- **500:** Error interno del servidor

### RainViewer
- **404:** Tile no encontrado
- **500:** Error interno del servidor

### Telegram
- **400:** Parámetros inválidos
- **401:** Token inválido
- **403:** Bot bloqueado
- **429:** Rate limit excedido

### Cloudflare Workers
- **400:** Parámetros inválidos
- **500:** Error interno del worker
- **503:** Servicio no disponible

## 🔄 Manejo de Errores

### Estrategias de Reintento

```javascript
async function fetchWithRetry(url, options = {}, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, options);
      if (response.ok) {
        return response;
      }
      throw new Error(`HTTP ${response.status}`);
    } catch (error) {
      if (i === maxRetries - 1) {
        throw error;
      }
      // Esperar antes del siguiente intento
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}
```

### Fallbacks

```javascript
async function getWeatherData(lat, lng) {
  try {
    // Intentar API principal
    return await fetchOpenMeteo(lat, lng);
  } catch (error) {
    console.warn('Open-Meteo falló, usando datos mock:', error);
    // Usar datos mock como fallback
    return getMockWeatherData();
  }
}
```

## 📈 Optimizaciones

### Caché
- **Frontend:** Caché de pronósticos por 5 minutos
- **Worker:** Caché de alertas en KV para evitar duplicados
- **APIs:** Usar headers de caché cuando estén disponibles

### Rate Limiting
- **Open-Meteo:** Máximo 100 requests/minuto
- **Telegram:** Máximo 30 mensajes/segundo
- **Worker:** Ejecutar cron cada 15 minutos

### Compresión
- **Gzip:** Habilitado en Cloudflare Workers
- **Minificación:** Código minificado en producción
- **Imágenes:** Optimización automática de tiles

## 🔒 Seguridad

### Autenticación
- **Telegram:** BOT_TOKEN requerido
- **Cloudflare:** Variables de entorno en Secrets
- **APIs:** Sin autenticación requerida (públicas)

### Validación
- **Input:** Validar coordenadas y parámetros
- **Output:** Sanitizar datos antes de mostrar
- **Rate Limiting:** Implementado en el worker

### Privacidad
- **Datos:** No se almacenan datos personales
- **Logs:** Solo logs de sistema, sin datos sensibles
- **APIs:** Solo datos meteorológicos públicos

---

Esta documentación te ayudará a entender y utilizar las APIs del sistema Clima Tracker. Para más información, consulta la documentación oficial de cada API.
