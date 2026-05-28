# Sérénité - TODO List

## Base de Datos y Backend
- [x] Extender schema.ts con tablas: mood_entries, journal_entries, breathing_exercises, notifications, user_preferences
- [x] Crear migraciones SQL para todas las tablas
- [x] Implementar helpers en server/db.ts para consultas de mood, journal, breathing, notifications
- [x] Crear procedimientos tRPC para: crear/leer/actualizar mood, journal, breathing, notifications
- [x] Integrar LLM para chatbot IA en francés
- [x] Implementar sistema de notificaciones/recordatorios

## Frontend - Estructura y Navegación
- [x] Crear DashboardLayout con sidebar navigation
- [x] Configurar rutas principales en App.tsx
- [x] Establecer tema de color elegante y profesional en index.css
- [x] Implementar useAuth hook para autenticación

## Frontend - Páginas Principales
- [x] Dashboard - Resumen del día, estadísticas, accesos rápidos
- [x] Mood Tracker - Selector visual de emociones, notas opcionales
- [x] Diario Personal - Editor de entradas, historial navegable
- [x] Chatbot IA - Interfaz de chat en francés
- [x] Ejercicios de Respiración - Animaciones guiadas
- [x] Gráficos de Progreso - Visualización con Recharts
- [x] Perfil de Usuario - Personalización y preferencias

## Testing
- [x] Escribir tests vitest para procedimientos tRPC
- [x] Escribir tests para componentes React críticos
- [x] Validar integración LLM

## Finalización
- [x] Revisar estilos y pulir UI
- [x] Probar todas las funcionalidades
- [x] Crear checkpoint final
- [x] Documentar cómo ejecutar el proyecto


## Bugs Reportados
- [x] Ruta / retorna error 404 - Corregido: ahora muestra Home en carga y redirige a Dashboard cuando autenticado


## Mejoras Solicitadas por Usuario
- [x] Arreglar temporizadores de respiración - Cada programa con su propio ciclo
- [x] Respuestas IA más cortas - Primera respuesta concisa
- [x] Selector de idioma - Francés/Español
- [x] Calificación de días - Estrellas 1-5 en diario
- [x] Cambio de cuenta - Opción en menú
- [x] Página de ajustes - Configuración centralizada
- [x] Colores más relajantes - Verde pastel, azul cian en botones
