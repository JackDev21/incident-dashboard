# Incident Dashboard

Frontend application built with React and TypeScript for incident management.

This project is designed to demonstrate frontend best practices, including modular architecture, separation of concerns, reusable components, and strong typing.

---

## 🚀 Technologies

- React
- TypeScript
- Vite
- SCSS (SASS)
- CSS Modules
- React Router
- pnpm

---

## 🎯 Project Goal

The main goal is to simulate a real application by applying:

- Scalable frontend architecture
- Reusable UI components
- Separation between presentation, logic, and data access
- Domain modeling with TypeScript
- A foundation for unit testing

---

## 🧠 Architecture

The project follows a **feature-based architecture**:

```txt
src/
  app/                # Global configuration (router)
  components/
    ui/               # Reusable components (Button, Card, etc.)
    layout/           # Layout components (global structure)
  features/
    incidents/        # Incident domain
      components/     # Domain components (IncidentCard)
      pages/          # Views (list, detail, creation)
      services/       # Data access (mock / API)
      mocks/          # Mock data
      types/          # Domain types
  styles/             # Global styles
```

---

## 🧩 Layer Separation

A clear separation of responsibilities has been applied:

- **UI**
  Reusable components and pages (`components`, `pages`)

- **Business logic**
  (in progress, to be implemented with hooks and utils)

- **Data access**
  Decoupled services (`services`)

- **Domain**
  Types and entities (`types`)

---

## 🔄 Data Flow

```txt
UI (pages/components)
        ↓
Services (services)
        ↓
Data (mock / API)
```

The UI never accesses data directly.

---

## 🧩 Reusable Components

A base UI layer has been created:

- `Button`
- `Card`

Example:

```tsx
<Button label="Create incident" variant="primary" />
```

Features:

- Typed props
- Configurable variants
- Encapsulated styles (CSS Modules)

---

## 🎨 Styling

- SCSS (SASS)
- CSS Modules

Benefits:

- Component-level style encapsulation
- Avoids global collisions
- Makes scaling easier

---

## 📄 Feature: Incidents

Main application functionality:

- Incident list
- Rendering through domain components (`IncidentCard`)
- Data loading through service (`getIncidents`)
- Local state usage (`useState`)
- Controlled effects (`useEffect`)

---

## ⚙️ Installation

### Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/incident-dashboard.git
cd incident-dashboard
```

### Install dependencies

```bash
pnpm install
```

### Run in development

```bash
pnpm dev
```

Open in browser:

```text
http://localhost:5173/
```

---

## 🧪 Testing (coming soon)

The project is ready to include:

- Unit tests for logic
- Component tests
- Interaction tests

---

## 🔧 Best Practices Applied

- Separation of concerns
- Reusable components
- Modular feature-based architecture
- Strong typing with TypeScript
- Decoupled data source
- Component composition

---

## 📌 Focus

This project is not only about functionality, but also about showing:

- how to structure a real frontend application
- how to scale code in a maintainable way
- how to work with reusable components

---

## 👤 Author

Jose A. Cantó (JackDev)
