# Sérénité - Aplicación de Salud Mental

**Sérénité** es una aplicación web moderna y elegante de bienestar mental que ayuda a los usuarios a hacer seguimiento de su estado emocional, reflexionar mediante un diario personal y recibir apoyo a través de un asistente de inteligencia artificial.

## Características Principales

✅ **Autenticación de Usuarios** - Registro e inicio de sesión con OAuth integrado
✅ **Dashboard Inteligente** - Resumen del día con estadísticas y accesos rápidos
✅ **Seguimiento de Humor** - Selector visual de emociones con 5 niveles
✅ **Diario Personal** - Editor de entradas con historial navegable
✅ **Chatbot IA** - Conversaciones en francés con soporte emocional
✅ **Ejercicios de Respiración** - 4 técnicas guiadas con animaciones
✅ **Gráficos de Progreso** - Visualización con Recharts
✅ **Notificaciones** - Recordatorios personalizados
✅ **Perfil de Usuario** - Configuración de preferencias

## Tecnología

**Frontend:**
- React 19 con TypeScript
- Tailwind CSS 4 para estilos
- Recharts para gráficos
- tRPC para comunicación con backend

**Backend:**
- Node.js con Express
- tRPC para procedimientos tipados
- MySQL/TiDB para base de datos
- Drizzle ORM para gestión de datos
- LLM integrado para chatbot IA

**Diseño:**
- Paleta de colores elegante (púrpura, verde menta, naranja)
- Tipografía refinada (Poppins + Playfair Display)
- Interfaz 100% en francés
- Tema claro profesional

## Instalación y Configuración

### Requisitos Previos
- Node.js 22.13.0 o superior
- pnpm 10.4.1 o superior
- Acceso a base de datos MySQL/TiDB

### Pasos de Instalación

1. **Clonar el repositorio**
```bash
cd /home/ubuntu/serenite-app
```

2. **Instalar dependencias**
```bash
pnpm install
```

3. **Configurar variables de entorno**
Las siguientes variables se inyectan automáticamente por el sistema:
- `DATABASE_URL` - Conexión a base de datos
- `JWT_SECRET` - Secreto para sesiones
- `VITE_APP_ID` - ID de aplicación OAuth
- `OAUTH_SERVER_URL` - URL del servidor OAuth
- `BUILT_IN_FORGE_API_URL` - URL de APIs integradas
- `BUILT_IN_FORGE_API_KEY` - Clave de APIs integradas

4. **Ejecutar migraciones de base de datos**
```bash
pnpm drizzle-kit generate
pnpm drizzle-kit migrate
```

5. **Iniciar el servidor de desarrollo**
```bash
pnpm dev
```

El servidor estará disponible en `http://localhost:3000`

## Estructura del Proyecto

```
serenite-app/
├── client/                      # Frontend React
│   ├── src/
│   │   ├── pages/              # Páginas principales
│   │   │   ├── Home.tsx        # Landing page
│   │   │   ├── Dashboard.tsx   # Panel principal
│   │   │   ├── MoodTracker.tsx # Seguimiento de humor
│   │   │   ├── Journal.tsx     # Diario personal
│   │   │   ├── Chat.tsx        # Chatbot IA
│   │   │   ├── Breathing.tsx   # Ejercicios de respiración
│   │   │   ├── Progress.tsx    # Gráficos de progreso
│   │   │   └── Profile.tsx     # Perfil de usuario
│   │   ├── components/         # Componentes reutilizables
│   │   ├── contexts/           # React contexts
│   │   ├── lib/                # Utilidades
│   │   ├── App.tsx             # Rutas principales
│   │   └── index.css           # Estilos globales
│   └── index.html              # HTML principal
├── server/                      # Backend Node.js
│   ├── routers.ts              # Procedimientos tRPC
│   ├── db.ts                   # Funciones de base de datos
│   ├── _core/                  # Código de infraestructura
│   └── *.test.ts               # Tests vitest
├── drizzle/                     # Esquema y migraciones
│   ├── schema.ts               # Definición de tablas
│   └── migrations/             # Archivos SQL de migraciones
├── shared/                      # Código compartido
└── package.json                # Dependencias del proyecto
```

## Uso de la Aplicación

### 1. Registro e Inicio de Sesión
- Haz clic en "Connexion" en la página de inicio
- Completa el proceso de autenticación OAuth
- Se creará automáticamente tu perfil de usuario

### 2. Dashboard
- Visualiza tu resumen diario
- Accede rápidamente a todas las funciones
- Ve tus estadísticas principales

### 3. Seguimiento de Humor
- Selecciona tu estado emocional (1-5)
- Añade etiquetas de emociones
- Registra tu nivel de energía y estrés
- Añade notas opcionales

### 4. Diario Personal
- Crea nuevas entradas
- Escribe tus pensamientos y reflexiones
- Navega por tu historial
- Elimina entradas si lo deseas

### 5. Chatbot IA
- Habla con Sérénité sobre tus sentimientos
- Recibe apoyo emocional inteligente
- Las conversaciones se guardan automáticamente
- Todo en francés

### 6. Ejercicios de Respiración
- Elige entre 4 técnicas diferentes
- Sigue las guías visuales animadas
- Registra tu nivel de relajación
- Completa la sesión

### 7. Gráficos de Progreso
- Visualiza tu humor a lo largo del tiempo
- Analiza tendencias de energía y estrés
- Compara múltiples métricas
- Identifica patrones

### 8. Perfil y Preferencias
- Personaliza tu biografía
- Establece recordatorios de humor
- Configura recordatorios de diario
- Activa/desactiva notificaciones

## Desarrollo

### Ejecutar Tests
```bash
pnpm test
```

### Compilar para Producción
```bash
pnpm build
```

### Iniciar en Producción
```bash
pnpm start
```

### Linting y Formato
```bash
pnpm format
```

## Base de Datos

### Tablas Principales

**users**
- Información de usuarios y autenticación
- Campos: id, openId, name, email, role, createdAt, updatedAt

**mood_entries**
- Registros de humor diarios
- Campos: id, userId, mood, emotionTags, notes, energyLevel, stressLevel, createdAt

**journal_entries**
- Entradas del diario personal
- Campos: id, userId, title, content, tags, createdAt, updatedAt

**breathing_exercises**
- Ejercicios de respiración completados
- Campos: id, userId, exerciseType, duration, relaxationLevel, createdAt

**chat_messages**
- Historial de conversaciones con IA
- Campos: id, userId, role, content, createdAt

**user_preferences**
- Preferencias personales del usuario
- Campos: userId, bio, moodReminderTime, journalReminderTime, notificationsEnabled

**notifications**
- Notificaciones del sistema
- Campos: id, userId, title, content, isRead, createdAt

## API tRPC

### Procedimientos Disponibles

**Mood**
- `mood.create` - Crear entrada de humor
- `mood.list` - Listar todas las entradas

**Journal**
- `journal.create` - Crear entrada de diario
- `journal.get` - Obtener entrada específica
- `journal.list` - Listar todas las entradas
- `journal.delete` - Eliminar entrada

**Breathing**
- `breathing.create` - Registrar ejercicio
- `breathing.list` - Listar ejercicios

**Chat**
- `chat.send` - Enviar mensaje a IA
- `chat.history` - Obtener historial

**Notifications**
- `notifications.list` - Listar notificaciones
- `notifications.markAsRead` - Marcar como leída

**Preferences**
- `preferences.get` - Obtener preferencias
- `preferences.update` - Actualizar preferencias

**Auth**
- `auth.me` - Obtener usuario actual
- `auth.logout` - Cerrar sesión

## Integración con LLM

El chatbot utiliza un modelo de lenguaje integrado para proporcionar conversaciones en francés. Las respuestas se generan en tiempo real con soporte para markdown.

**Características:**
- Conversaciones contextuales
- Respuestas empáticas
- Soporte para múltiples idiomas (principalmente francés)
- Historial persistente

## Mejoras Futuras

- [ ] Integración con wearables (Fitbit, Apple Watch)
- [ ] Análisis predictivo de bienestar
- [ ] Comunidad de usuarios
- [ ] Planes de tratamiento personalizados
- [ ] Integración con profesionales de salud mental
- [ ] Aplicación móvil nativa
- [ ] Exportación de datos (PDF, CSV)
- [ ] Sincronización multi-dispositivo
- [ ] Temas personalizables
- [ ] Modo offline

## Solución de Problemas

### El servidor no inicia
```bash
# Verifica que la base de datos está disponible
# Verifica las variables de entorno
# Ejecuta las migraciones nuevamente
pnpm drizzle-kit migrate
```

### Errores de autenticación
- Verifica que `VITE_APP_ID` es correcto
- Comprueba la URL de OAuth
- Limpia las cookies del navegador

### El chatbot no responde
- Verifica que `BUILT_IN_FORGE_API_KEY` es válido
- Comprueba la conexión a internet
- Revisa los logs del servidor

## Contribución

Las contribuciones son bienvenidas. Por favor:
1. Fork el repositorio
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

## Licencia

Este proyecto está bajo licencia MIT.

## Soporte

Para reportar bugs o solicitar features, por favor abre un issue en el repositorio.

## Autor

Desarrollado con ❤️ para tu bienestar mental.

---

**Sérénité** - Tu compañero de bienestar mental 🧘‍♀️
