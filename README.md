# Incident Dashboard

Aplicación frontend desarrollada con React y TypeScript para la gestión de incidencias.

Este proyecto está orientado a demostrar buenas prácticas en desarrollo frontend, incluyendo arquitectura modular, separación de responsabilidades, componentes reutilizables y tipado fuerte.

---

## 🚀 Tecnologías

- React
- TypeScript
- Vite
- SCSS (SASS)
- CSS Modules
- React Router
- pnpm

---

## 🎯 Objetivo del proyecto

El objetivo principal es simular una aplicación real aplicando:

- Arquitectura frontend escalable
- Componentes reutilizables (UI layer)
- Separación entre presentación, lógica y acceso a datos
- Modelado de dominio con TypeScript
- Base para testing unitario

---

## 🧠 Arquitectura

El proyecto sigue una estructura basada en **features (feature-based architecture)**:

```txt
src/
  app/                # Configuración global (router)
  components/
    ui/               # Componentes reutilizables (Button, Card, etc.)
    layout/           # Componentes de layout (estructura global)
  features/
    incidents/        # Dominio de incidencias
      components/     # Componentes de dominio (IncidentCard)
      pages/          # Vistas (listado, detalle, creación)
      services/       # Acceso a datos (mock / API)
      mocks/          # Datos simulados
      types/          # Tipos del dominio
  styles/             # Estilos globales
```

---

## 🧩 Separación de capas

Se ha aplicado una separación clara de responsabilidades:

- **UI (presentación)**  
  Componentes reutilizables y páginas (`components`, `pages`)

- **Lógica de negocio**  
  (en evolución, se implementará con hooks y utils)

- **Acceso a datos**  
  Servicios desacoplados (`services`)

- **Dominio**  
  Tipos y entidades (`types`)

---

## 🔄 Flujo de datos

```txt
UI (pages/components)
        ↓
Servicios (services)
        ↓
Datos (mock / API)
```

La UI nunca accede directamente a los datos.

---

## 🧩 Componentes reutilizables

Se ha creado una capa de UI base:

- `Button`
- `Card`

Ejemplo:

```tsx
<Button label="Crear incidencia" variant="primary" />
```

Características:

- Props tipadas
- Variantes configurables
- Estilos encapsulados (CSS Modules)

---

## 🎨 Estilos

- SCSS (SASS)
- CSS Modules

Ventajas:

- Encapsulación de estilos por componente
- Evita colisiones globales
- Facilita escalabilidad

---

## 📄 Feature: Incidents

Funcionalidad principal de la aplicación:

- Listado de incidencias
- Renderizado mediante componentes de dominio (`IncidentCard`)
- Carga de datos a través de servicio (`getIncidents`)
- Uso de estado local (`useState`)
- Efectos controlados (`useEffect`)

---

## ⚙️ Instalación

### Clonar repositorio

```bash
git clone https://github.com/TU_USUARIO/incident-dashboard.git
cd incident-dashboard
```

### Instalar dependencias

```bash
pnpm install
```

### Ejecutar en desarrollo

```bash
pnpm dev
```

Abrir en navegador:

```text
http://localhost:5173/
```

---

## 🧪 Testing (próximamente)

El proyecto está preparado para incluir:

- Tests unitarios de lógica
- Tests de componentes
- Tests de interacción

---

## 🔧 Buenas prácticas aplicadas

- Separación de responsabilidades
- Componentes reutilizables
- Arquitectura modular por features
- Tipado fuerte con TypeScript
- Desacoplamiento de la fuente de datos
- Composición de componentes

---

## 📌 Enfoque

Este proyecto no busca solo funcionalidad, sino demostrar:

- cómo estructurar una aplicación frontend real
- cómo escalar código de forma mantenible
- cómo trabajar con componentes reutilizables

---

## 👤 Autor

Jose A. Cantó (JackDev)
