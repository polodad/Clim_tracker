# Guía de Contribución - Clima Tracker

¡Gracias por tu interés en contribuir a Clima Tracker! Este documento te guiará a través del proceso de contribución.

## 🚀 Cómo Contribuir

### 1. Fork del Repositorio

1. Ve a [Clima Tracker](https://github.com/tu-usuario/clima-tracker)
2. Click en "Fork" en la esquina superior derecha
3. Clona tu fork localmente:

```bash
git clone https://github.com/tu-usuario/clima-tracker.git
cd clima-tracker
```

### 2. Configurar el Entorno

```bash
# Instalar dependencias
npm install

# Instalar dependencias del worker
cd worker
npm install
cd ..

# Configurar variables de entorno
cp env.example .env
# Edita .env con tus valores
```

### 3. Crear una Rama

```bash
git checkout -b feature/nombre-de-tu-feature
```

## 📝 Tipos de Contribuciones

### 🐛 Reportar Bugs

1. **Verifica que no exista** el bug reportado
2. **Usa el template** de bug report
3. **Incluye información** detallada:
   - Pasos para reproducir
   - Comportamiento esperado vs actual
   - Screenshots si aplica
   - Información del sistema

### ✨ Sugerir Mejoras

1. **Verifica que no exista** la sugerencia
2. **Usa el template** de feature request
3. **Describe claramente**:
   - Problema que resuelve
   - Solución propuesta
   - Alternativas consideradas

### 🔧 Contribuir Código

#### Frontend
- **Ubicación:** `src/`
- **Tecnologías:** TypeScript, Leaflet, Vite
- **Estilo:** Sigue las convenciones existentes

#### Worker
- **Ubicación:** `worker/src/`
- **Tecnologías:** TypeScript, Cloudflare Workers
- **APIs:** Open-Meteo, RainViewer, Telegram

#### Datos
- **Ubicación:** `data/`
- **Formatos:** GeoJSON, JSON
- **Validación:** Verifica estructura antes de commit

## 🧪 Testing

### Frontend
```bash
# Desarrollo
npm run dev

# Build
npm run build

# Preview
npm run preview
```

### Worker
```bash
cd worker

# Desarrollo
npm run dev

# Deploy
npm run deploy

# Logs
npm run tail
```

### Pruebas de Alertas
```bash
# Probar sistema completo
node scripts/test-alerts.js

# Simular vehículos
node scripts/simulate-vehicles.js
```

## 📋 Estándares de Código

### TypeScript
- **Tipos:** Define interfaces para todos los objetos
- **Nombres:** Usa camelCase para variables y funciones
- **Comentarios:** Documenta funciones complejas

### HTML/CSS
- **Semántica:** Usa elementos HTML apropiados
- **Accesibilidad:** Incluye atributos alt, aria-label, etc.
- **Responsive:** Diseño adaptable a móviles

### JSON
- **Formato:** 2 espacios de indentación
- **Validación:** Verifica estructura antes de commit
- **Comentarios:** No uses comentarios en JSON

## 🔍 Proceso de Revisión

### 1. Pull Request

1. **Crea un PR** desde tu fork
2. **Usa el template** de pull request
3. **Describe claramente**:
   - Qué cambios haces
   - Por qué los haces
   - Cómo probarlos

### 2. Revisión

- **Automática:** CI/CD verifica build y tests
- **Manual:** Maintainers revisan código
- **Feedback:** Responde a comentarios rápidamente

### 3. Merge

- **Aprobación:** Requiere al menos 1 aprobación
- **Tests:** Todos los tests deben pasar
- **Conflictos:** Resuelve conflictos antes del merge

## 📚 Documentación

### README
- **Actualiza** si agregas nuevas features
- **Incluye** ejemplos de uso
- **Mantén** instrucciones actualizadas

### API Docs
- **Documenta** nuevas APIs
- **Incluye** ejemplos de request/response
- **Actualiza** límites y errores

### Comentarios
- **Código:** Comenta lógica compleja
- **Funciones:** Documenta parámetros y retorno
- **Clases:** Explica propósito y uso

## 🎯 Áreas de Contribución

### 🚀 Prioridad Alta
- **Optimización** de rendimiento
- **Mejoras** de UX/UI
- **Nuevas** fuentes de datos meteorológicos
- **Integración** con más APIs

### 🔧 Prioridad Media
- **Tests** automatizados
- **Documentación** mejorada
- **Internacionalización** (i18n)
- **Modo oscuro**

### 💡 Prioridad Baja
- **Nuevas** visualizaciones
- **Análisis** de tendencias
- **Exportación** de datos
- **Integración** con más plataformas

## 🐛 Reportar Problemas

### Template de Bug Report

```markdown
**Descripción del Bug**
Descripción clara y concisa del problema.

**Pasos para Reproducir**
1. Ve a '...'
2. Click en '...'
3. Scroll hasta '...'
4. Ve el error

**Comportamiento Esperado**
Descripción de lo que esperabas que pasara.

**Comportamiento Actual**
Descripción de lo que realmente pasó.

**Screenshots**
Si aplica, agrega screenshots.

**Información del Sistema**
- OS: [e.g. Windows 10]
- Navegador: [e.g. Chrome 91]
- Versión: [e.g. 1.0.0]

**Contexto Adicional**
Cualquier otra información relevante.
```

### Template de Feature Request

```markdown
**¿Tu feature request está relacionada con un problema?**
Descripción clara del problema.

**Describe la solución que te gustaría**
Descripción clara de lo que quieres que pase.

**Describe alternativas que has considerado**
Descripción de soluciones alternativas.

**Contexto adicional**
Cualquier otra información o screenshots.
```

## 🤝 Código de Conducta

### Nuestros Compromisos

- **Inclusivo:** Ambiente acogedor para todos
- **Respetuoso:** Tratamiento respetuoso
- **Colaborativo:** Trabajo en equipo
- **Constructivo:** Feedback útil y positivo

### Comportamiento Esperado

- Usar lenguaje inclusivo
- Respetar puntos de vista diferentes
- Aceptar feedback constructivo
- Enfocarse en lo mejor para la comunidad

### Comportamiento Inaceptable

- Lenguaje ofensivo o discriminatorio
- Comentarios despectivos o insultos
- Acoso público o privado
- Cualquier conducta inapropiada

## 📞 Contacto

- **Issues:** [GitHub Issues](https://github.com/tu-usuario/clima-tracker/issues)
- **Discusiones:** [GitHub Discussions](https://github.com/tu-usuario/clima-tracker/discussions)
- **Email:** clima-tracker@example.com

## 🙏 Agradecimientos

Gracias a todos los contribuidores que hacen posible Clima Tracker:

- **Contribuidores:** [Ver lista completa](https://github.com/tu-usuario/clima-tracker/graphs/contributors)
- **Mantenedores:** [Ver lista](https://github.com/tu-usuario/clima-tracker/blob/main/MAINTAINERS.md)
- **Sponsors:** [Ver lista](https://github.com/tu-usuario/clima-tracker/blob/main/SPONSORS.md)

---

**¡Gracias por contribuir a Clima Tracker! 🌧️**
