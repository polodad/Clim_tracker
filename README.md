# Clima Tracker - Sistema de Monitoreo de Lluvia e Inundaciones

Un MVP gratuito para monitorear lluvia e inundaciones para flotas en México, con alertas automáticas vía Telegram.

## 🌟 Características

- **Mapa interactivo** con Leaflet y radar en tiempo real
- **Pronóstico por hora** al hacer clic en el mapa
- **Geocercas** (puntos bajos, vados, bases) en GeoJSON
- **Marcadores de vehículos** desde JSON
- **Alertas automáticas** vía Telegram con Cloudflare Workers
- **Hosting estático** compatible con GitHub Pages y Netlify

## 🚀 Demo en Vivo

[Ver demo](https://polodad.github.io/clima-tracker/)


## 📋 Requisitos

- Node.js 18+
- Cuenta de Telegram (para bot)
- Cuenta de Cloudflare (para Workers)
- Cuenta de GitHub (para hosting)

## 🛠️ Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/polodad/clima-tracker.git
cd clima-tracker
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Copia el archivo de ejemplo y configura tus variables:

```bash
cp .env.example .env
```

Edita `.env` con tus valores:

```env
TELEGRAM_BOT_TOKEN=tu_bot_token_aqui
TELEGRAM_CHAT_ID=tu_chat_id_aqui
```

## 🤖 Configuración del Bot de Telegram

### Paso 1: Crear un Bot

1. Abre Telegram y busca `@BotFather`
2. Envía `/newbot`
3. Sigue las instrucciones para crear tu bot
4. Guarda el **BOT_TOKEN** que te proporciona

### Paso 2: Obtener Chat ID

1. Agrega tu bot a un grupo o inicia una conversación
2. Envía un mensaje al bot
3. Visita: `https://api.telegram.org/bot<BOT_TOKEN>/getUpdates`
4. Busca el `chat.id` en la respuesta JSON

### Paso 3: Configurar el Bot

Edita `data/config.json` con tus preferencias:

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

## 🗺️ Configuración de Datos

### Geocercas (`data/geofences.geojson`)

Define las zonas de riesgo en formato GeoJSON:

```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "name": "Vado Río Bravo",
        "risk": "alto",
        "description": "Punto de cruce crítico"
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [-99.1234, 19.4326],
          [-99.1200, 19.4326],
          [-99.1200, 19.4300],
          [-99.1234, 19.4300],
          [-99.1234, 19.4326]
        ]]
      }
    }
  ]
}
```

### Vehículos (`data/vehicles.json`)

Define tu flota de vehículos:

```json
{
  "vehicles": [
    {
      "id": "Kwid-01",
      "name": "Vehículo Principal",
      "lat": 19.4326,
      "lng": -99.1332,
      "lastSeen": "2024-01-15T10:30:00-06:00",
      "status": "active",
      "driver": "Juan Pérez"
    }
  ]
}
```

## 🚀 Despliegue

### Frontend (GitHub Pages) - Despliegue Automático

El proyecto está configurado para desplegarse automáticamente en GitHub Pages usando GitHub Actions.

#### Pasos para el despliegue:

1. **Hacer push a GitHub:**
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. **Configurar GitHub Pages:**
   - Ve a tu repositorio en GitHub
   - Ve a **Settings** > **Pages**
   - En **Source**, selecciona **"GitHub Actions"**
   - Guarda la configuración

3. **El despliegue se ejecutará automáticamente:**
   - Cada vez que hagas push a la rama `main`
   - El workflow construirá el proyecto y lo desplegará
   - Tu sitio estará disponible en: `https://polodad.github.io/clima-tracker/`

4. **Actualizar URLs en el código:**
   - URLs actualizadas para el usuario: polodad

#### Configuración manual (alternativa):

Si prefieres desplegar manualmente:
```bash
# Construir el proyecto
npm run build

# Subir la carpeta dist/ a la rama gh-pages
# (GitHub Actions hace esto automáticamente)
```

### Worker (Cloudflare)

1. **Instalar Wrangler:**
```bash
npm install -g wrangler
```

2. **Autenticarse:**
```bash
wrangler login
```

3. **Configurar variables:**
```bash
wrangler secret put TELEGRAM_BOT_TOKEN
wrangler secret put TELEGRAM_CHAT_ID
```

4. **Desplegar:**
```bash
cd worker
npm run deploy
```

5. **Configurar cron:**
   - Ve a Cloudflare Dashboard > Workers & Pages
   - Selecciona tu worker
   - Ve a Settings > Triggers
   - Agrega cron: `*/15 * * * *` (cada 15 minutos)

## 🧪 Pruebas

### Desarrollo Local

```bash
# Frontend
npm run dev

# Worker
cd worker
npm run dev
```

### Prueba de Alertas

```bash
# Enviar alerta de prueba
curl https://tu-worker.tu-subdomain.workers.dev/test-alert
```

### Verificar Estado

```bash
# Verificar estado del worker
curl https://tu-worker.tu-subdomain.workers.dev/status
```

## 📊 APIs Utilizadas

### Open-Meteo (Pronóstico)
- **Endpoint:** `https://api.open-meteo.com/v1/forecast`
- **Límites:** 10,000 requests/día gratis
- **Datos:** Precipitación, probabilidad de lluvia

### RainViewer (Radar)
- **Endpoint:** `https://tilecache.rainviewer.com/v2/radar/`
- **Límites:** Sin límites conocidos
- **Datos:** Imágenes de radar en tiempo real

## 🔧 Configuración Avanzada

### Reglas de Alerta

El sistema evalúa estas condiciones:

1. **Lluvia intensa inminente:**
   - Probabilidad ≥ threshold (default: 70%)
   - Precipitación ≥ mm/h (default: 5mm/h)
   - Dentro de una geocerca

2. **Vehículo en zona de riesgo:**
   - Vehículo activo cerca de geocerca de alto riesgo
   - Distancia ≤ radar_distance_km (default: 10km)

3. **Cooldown de alertas:**
   - No repetir la misma alerta por cooldown_min (default: 30min)

### Personalización

- **Umbrales:** Modifica `data/config.json`
- **Geocercas:** Edita `data/geofences.geojson`
- **Vehículos:** Actualiza `data/vehicles.json`
- **Estilos:** Modifica `index.html` y `src/`

## 🐛 Solución de Problemas

### Error: "Bot token not found"
- Verifica que `TELEGRAM_BOT_TOKEN` esté configurado
- Asegúrate de que el bot esté activo

### Error: "Chat ID not found"
- Verifica que `TELEGRAM_CHAT_ID` sea correcto
- Asegúrate de que el bot esté en el chat

### Error: "API rate limit exceeded"
- Open-Meteo tiene límite de 10,000 requests/día
- Considera implementar caché local

### Error: "Worker not responding"
- Verifica que el cron esté configurado
- Revisa los logs en Cloudflare Dashboard

## 📈 Monitoreo

### Logs del Worker
```bash
wrangler tail
```

### Métricas de Telegram
- Revisa el chat de Telegram para alertas
- Verifica que los mensajes lleguen correctamente

### Estado del Sistema
- Frontend: Verifica que el mapa cargue
- APIs: Revisa la consola del navegador
- Worker: Usa `/status` endpoint

## 🔒 Seguridad

- **Tokens:** Nunca commites tokens en el código
- **Variables:** Usa Cloudflare Secrets para tokens
- **CORS:** Configurado para dominios específicos
- **Rate Limiting:** Implementado en el worker

## 📝 Límites y Consideraciones

### Límites de API
- **Open-Meteo:** 10,000 requests/día
- **RainViewer:** Sin límites conocidos
- **Telegram:** 30 mensajes/segundo por bot

### Fallbacks
- Si Open-Meteo falla, se usan datos mock
- Si RainViewer falla, se oculta el radar
- Si Telegram falla, se registra en logs

### Escalabilidad
- Para más de 100 vehículos, considera base de datos
- Para más de 1000 geocercas, optimiza algoritmos
- Para alta frecuencia, considera Redis para caché

## 🤝 Contribuciones

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 🆘 Soporte

- **Issues:** [GitHub Issues](https://github.com/polodad/clima-tracker/issues)
- **Documentación:** [Wiki](https://github.com/polodad/clima-tracker/wiki)
- **Discusiones:** [GitHub Discussions](https://github.com/polodad/clima-tracker/discussions)

## 🙏 Agradecimientos

- [Open-Meteo](https://open-meteo.com/) por la API de pronóstico
- [RainViewer](https://www.rainviewer.com/) por las imágenes de radar
- [Leaflet](https://leafletjs.com/) por la librería de mapas
- [Cloudflare](https://cloudflare.com/) por los Workers
- [Telegram](https://telegram.org/) por la API de bots

---

**Desarrollado con ❤️ para la seguridad de las flotas en México**
