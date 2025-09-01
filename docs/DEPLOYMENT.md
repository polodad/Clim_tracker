# Guía de Despliegue - Clima Tracker

Esta guía te ayudará a desplegar el sistema Clima Tracker paso a paso.

## 📋 Prerrequisitos

- Cuenta de GitHub
- Cuenta de Cloudflare
- Cuenta de Telegram
- Node.js 18+ instalado

## 🚀 Despliegue del Frontend (GitHub Pages)

### Paso 1: Preparar el Repositorio

1. **Fork o clona el repositorio:**
```bash
git clone https://github.com/tu-usuario/clima-tracker.git
cd clima-tracker
```

2. **Instalar dependencias:**
```bash
npm install
```

3. **Construir el proyecto:**
```bash
npm run build
```

### Paso 2: Configurar GitHub Pages

1. **Hacer push al repositorio:**
```bash
git add .
git commit -m "Initial deployment"
git push origin main
```

2. **Configurar Pages en GitHub:**
   - Ve a tu repositorio en GitHub
   - Click en "Settings" > "Pages"
   - En "Source", selecciona "Deploy from a branch"
   - Selecciona "main" branch y "/ (root)" folder
   - Click "Save"

3. **Esperar el despliegue:**
   - GitHub Pages tardará unos minutos en desplegar
   - Tu sitio estará disponible en: `https://tu-usuario.github.io/clima-tracker/`

### Paso 3: Actualizar URLs en el Código

1. **Actualizar `vite.config.ts`:**
```typescript
export default defineConfig({
  base: '/clima-tracker/', // Cambia por tu nombre de repositorio
  // ... resto de configuración
})
```

2. **Actualizar URLs en el Worker:**
   - Edita `worker/src/index.ts`
   - Cambia las URLs de GitHub por las de tu repositorio

## ☁️ Despliegue del Worker (Cloudflare)

### Paso 1: Configurar Wrangler

1. **Instalar Wrangler globalmente:**
```bash
npm install -g wrangler
```

2. **Autenticarse con Cloudflare:**
```bash
wrangler login
```

3. **Verificar autenticación:**
```bash
wrangler whoami
```

### Paso 2: Configurar el Worker

1. **Navegar al directorio del worker:**
```bash
cd worker
```

2. **Instalar dependencias:**
```bash
npm install
```

3. **Configurar variables de entorno:**
```bash
# Configurar el token del bot de Telegram
wrangler secret put TELEGRAM_BOT_TOKEN
# Ingresa tu token cuando se te solicite

# Configurar el chat ID
wrangler secret put TELEGRAM_CHAT_ID
# Ingresa tu chat ID cuando se te solicite
```

### Paso 3: Desplegar el Worker

1. **Desplegar:**
```bash
wrangler deploy
```

2. **Verificar el despliegue:**
```bash
# Probar el endpoint de estado
curl https://tu-worker.tu-subdomain.workers.dev/status

# Probar alerta de prueba
curl https://tu-worker.tu-subdomain.workers.dev/test-alert
```

### Paso 4: Configurar Cron

1. **En Cloudflare Dashboard:**
   - Ve a Workers & Pages
   - Selecciona tu worker
   - Click en "Settings" > "Triggers"
   - Click "Add Cron Trigger"
   - Configura: `*/15 * * * *` (cada 15 minutos)
   - Click "Save"

## 🤖 Configuración del Bot de Telegram

### Paso 1: Crear el Bot

1. **Abrir Telegram y buscar `@BotFather`**
2. **Enviar `/newbot`**
3. **Seguir las instrucciones:**
   - Nombre del bot: `Clima Tracker Bot`
   - Username: `clima_tracker_bot` (debe ser único)
4. **Guardar el BOT_TOKEN**

### Paso 2: Obtener Chat ID

1. **Agregar el bot a un grupo o iniciar conversación**
2. **Enviar un mensaje al bot**
3. **Visitar esta URL (reemplaza BOT_TOKEN):**
```
https://api.telegram.org/bot<BOT_TOKEN>/getUpdates
```
4. **Buscar el `chat.id` en la respuesta JSON**

### Paso 3: Configurar el Bot

1. **Configurar comandos del bot:**
```bash
curl -X POST "https://api.telegram.org/bot<BOT_TOKEN>/setMyCommands" \
-H "Content-Type: application/json" \
-d '{
  "commands": [
    {"command": "start", "description": "Iniciar el bot"},
    {"command": "status", "description": "Ver estado del sistema"},
    {"command": "test", "description": "Enviar alerta de prueba"}
  ]
}'
```

## 🔧 Configuración de Datos

### Actualizar Geocercas

1. **Editar `data/geofences.geojson`:**
```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "name": "Tu Geocerca",
        "risk": "alto",
        "description": "Descripción de la zona de riesgo"
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [lng1, lat1],
          [lng2, lat2],
          [lng3, lat3],
          [lng4, lat4],
          [lng1, lat1]
        ]]
      }
    }
  ]
}
```

### Actualizar Vehículos

1. **Editar `data/vehicles.json`:**
```json
{
  "vehicles": [
    {
      "id": "Veh-01",
      "name": "Vehículo Principal",
      "lat": 19.4326,
      "lng": -99.1332,
      "lastSeen": "2024-01-15T10:30:00-06:00",
      "status": "active",
      "driver": "Conductor"
    }
  ]
}
```

### Configurar Reglas de Alerta

1. **Editar `data/config.json`:**
```json
{
  "telegram_chat_id": "tu_chat_id",
  "rain_probability_threshold": 70,
  "rain_intensity_mmph": 5,
  "radar_distance_km": 10,
  "alert_cooldown_min": 30,
  "timezone": "America/Mexico_City"
}
```

## ✅ Verificación del Despliegue

### Frontend

1. **Verificar que el mapa cargue:**
   - Visita tu sitio en GitHub Pages
   - Verifica que el mapa de México se muestre
   - Prueba hacer clic en el mapa para ver pronóstico

2. **Verificar funcionalidades:**
   - Toggle del radar
   - Toggle de geocercas
   - Toggle de vehículos
   - Panel de estado

### Worker

1. **Verificar endpoints:**
```bash
# Estado del worker
curl https://tu-worker.tu-subdomain.workers.dev/status

# Alerta de prueba
curl https://tu-worker.tu-subdomain.workers.dev/test-alert
```

2. **Verificar logs:**
```bash
wrangler tail
```

3. **Verificar cron:**
   - Espera 15 minutos
   - Revisa los logs para ver ejecuciones automáticas

### Bot de Telegram

1. **Verificar que el bot responda:**
   - Envía `/start` al bot
   - Envía `/status` al bot
   - Envía `/test` al bot

2. **Verificar alertas:**
   - Configura umbrales bajos en `config.json`
   - Espera a que se dispare una alerta
   - Verifica que llegue el mensaje a Telegram

## 🐛 Solución de Problemas

### Error: "Site not found"
- Verifica que GitHub Pages esté habilitado
- Asegúrate de que el branch sea "main"
- Verifica que el archivo `index.html` esté en la raíz

### Error: "Worker not responding"
- Verifica que el worker esté desplegado
- Revisa los logs con `wrangler tail`
- Verifica que las variables de entorno estén configuradas

### Error: "Bot not responding"
- Verifica que el BOT_TOKEN sea correcto
- Asegúrate de que el bot esté activo
- Verifica que el CHAT_ID sea correcto

### Error: "API rate limit exceeded"
- Open-Meteo tiene límite de 10,000 requests/día
- Considera implementar caché local
- Reduce la frecuencia del cron si es necesario

## 📊 Monitoreo Post-Despliegue

### Métricas a Monitorear

1. **Frontend:**
   - Tiempo de carga del sitio
   - Errores en la consola del navegador
   - Disponibilidad de las APIs

2. **Worker:**
   - Ejecuciones del cron
   - Errores en los logs
   - Tiempo de respuesta de las APIs

3. **Bot:**
   - Mensajes enviados exitosamente
   - Errores de envío
   - Tiempo de respuesta

### Herramientas de Monitoreo

1. **GitHub Pages:**
   - Ve a Settings > Pages para ver el estado
   - Revisa Actions para ver builds

2. **Cloudflare:**
   - Dashboard > Workers & Pages
   - Revisa Analytics para métricas
   - Usa `wrangler tail` para logs en tiempo real

3. **Telegram:**
   - Revisa el chat para alertas
   - Usa `@BotFather` para estadísticas del bot

## 🔄 Actualizaciones

### Actualizar Frontend

1. **Hacer cambios en el código**
2. **Construir el proyecto:**
```bash
npm run build
```
3. **Hacer commit y push:**
```bash
git add .
git commit -m "Update frontend"
git push origin main
```

### Actualizar Worker

1. **Hacer cambios en `worker/src/index.ts`**
2. **Desplegar:**
```bash
cd worker
wrangler deploy
```

### Actualizar Datos

1. **Editar archivos en `data/`**
2. **Hacer commit y push:**
```bash
git add data/
git commit -m "Update data"
git push origin main
```

## 🎯 Próximos Pasos

1. **Configurar monitoreo avanzado**
2. **Implementar base de datos para vehículos**
3. **Agregar más fuentes de datos meteorológicos**
4. **Implementar notificaciones push**
5. **Agregar análisis de tendencias**

---

¡Tu sistema Clima Tracker está listo para monitorear lluvia e inundaciones! 🌧️
