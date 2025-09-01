export class WeatherService {
  private baseUrl = 'https://api.open-meteo.com/v1/forecast';

  async getForecast(lat: number, lng: number): Promise<any[]> {
    try {
      const params = new URLSearchParams({
        latitude: lat.toString(),
        longitude: lng.toString(),
        hourly: 'precipitation,precipitation_probability',
        forecast_hours: '12',
        timezone: 'America/Mexico_City'
      });

      const response = await fetch(`${this.baseUrl}?${params}`);
      
      if (!response.ok) {
        throw new Error(`Error en API: ${response.status}`);
      }

      const data = await response.json();
      
      // Procesar datos para las próximas 12 horas
      const forecast = [];
      for (let i = 0; i < 12; i++) {
        forecast.push({
          time: data.hourly.time[i],
          precipitation: data.hourly.precipitation[i] || 0,
          precipitation_probability: data.hourly.precipitation_probability[i] || 0
        });
      }

      return forecast;
    } catch (error) {
      console.error('Error al obtener pronóstico:', error);
      throw error;
    }
  }

  async getCurrentWeather(lat: number, lng: number): Promise<any> {
    try {
      const params = new URLSearchParams({
        latitude: lat.toString(),
        longitude: lng.toString(),
        current: 'precipitation,precipitation_probability',
        timezone: 'America/Mexico_City'
      });

      const response = await fetch(`${this.baseUrl}?${params}`);
      
      if (!response.ok) {
        throw new Error(`Error en API: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        precipitation: data.current.precipitation || 0,
        precipitation_probability: data.current.precipitation_probability || 0,
        time: data.current.time
      };
    } catch (error) {
      console.error('Error al obtener clima actual:', error);
      // Retornar datos mock en caso de error
      return {
        precipitation: 0,
        precipitation_probability: 0,
        time: new Date().toISOString()
      };
    }
  }

  async getRadarData(): Promise<any> {
    try {
      // Obtener información del radar de RainViewer
      const response = await fetch('https://api.rainviewer.com/public/weather-maps.json');
      
      if (!response.ok) {
        throw new Error(`Error en API RainViewer: ${response.status}`);
      }

      const data = await response.json();
      
      // Retornar el timestamp más reciente
      if (data.radar && data.radar.past && data.radar.past.length > 0) {
        return {
          latest: data.radar.past[data.radar.past.length - 1],
          timestamps: data.radar.past
        };
      }

      return null;
    } catch (error) {
      console.error('Error al obtener datos del radar:', error);
      return null;
    }
  }

  // Método para verificar si hay condiciones de riesgo
  checkRiskConditions(forecast: any[], config: any): boolean {
    // Verificar próximas 2 horas (120 minutos)
    const next2Hours = forecast.slice(0, 2);
    
    return next2Hours.some(hour => 
      hour.precipitation_probability >= config.rain_probability_threshold &&
      hour.precipitation >= config.rain_intensity_mmph
    );
  }

  // Método para obtener el nivel de riesgo de una ubicación
  getRiskLevel(lat: number, lng: number, forecast: any[], config: any): 'low' | 'medium' | 'high' {
    const next3Hours = forecast.slice(0, 3);
    
    // Contar horas con condiciones de riesgo
    const riskHours = next3Hours.filter(hour => 
      hour.precipitation_probability >= config.rain_probability_threshold &&
      hour.precipitation >= config.rain_intensity_mmph
    ).length;

    if (riskHours >= 2) return 'high';
    if (riskHours >= 1) return 'medium';
    return 'low';
  }
}
