# Incident Dashboard

Frontend application built with **React** and **TypeScript** for the **Incident Management System**. This project provides a modern, responsive interface to visualize and manage incidents.

For more details about the overall project, check the [Root README](../README.md).

---

## 🚀 Overview

This dashboard is designed to:
- **Visualize incidents** in a user-friendly interface.
- **Interact with the backend API** (`incident-api`) to manage incidents.
- **Follow best practices** for scalability, maintainability, and separation of concerns.

---

## 🛠️ Technologies

- **Framework**: React
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: SCSS + CSS Modules
- **State Management**: React Query
- **Routing**: React Router DOM
- **UI Components**: Lucide React (icons)
- **Package Manager**: pnpm

---

## 📂 Project Structure

The project follows a **feature-based architecture** to ensure scalability and maintainability:

```txt
src/
  app/                # Global configuration (router, providers)
  components/
    ui/               # Reusable UI components (Button, Card, etc.)
    layout/           # Layout components (global structure)
  features/
    incidents/        # Incident domain
      components/     # Domain-specific components (IncidentCard, IncidentForm)
      pages/          # Views (IncidentList, IncidentDetail, CreateIncident)
      services/       # Data access layer (API calls)
      types/          # Domain types (Incident, IncidentStatus, etc.)
  styles/           # Global styles and variables
```

---

## 🔗 Architecture & Data Flow

The frontend follows a **decoupled architecture** where:

1. **UI Components** (pages, components) interact with **services** to fetch or send data.
2. **Services** communicate with the **backend API** (`incident-api`).
3. **State management** is handled by **React Query** for caching and synchronization.

```mermaid
 graph TD
   A[UI Components] --> B[Services]
   B --> C[Backend API (incident-api)]
```

---

## 🧩 Key Features

### Reusable UI Components

A base UI layer has been created to ensure consistency and reusability:

- `Button`
- `Card`
- `Modal`

Example:

```tsx
<Button label="Create Incident" variant="primary" onClick={handleCreate} />
```

Features:
- **Typed props** for better developer experience.
- **Configurable variants** (e.g., `primary`, `secondary`).
- **Encapsulated styles** using CSS Modules.

---

### Incident Management

The main functionality includes:

- **Incident List**: Displays all incidents in a responsive grid.
- **Incident Detail**: Shows detailed information about a specific incident.
- **Create/Edit Incident**: Forms to create or update incidents.
- **Delete Incident**: Option to delete an incident.

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v20 or later)
- **pnpm** (v9 or later)

### Environment Variables

| Variable       | Description            | Example                 |
| -------------- | ---------------------- | ----------------------- |
| `VITE_API_URL` | URL of the backend API | `http://localhost:3000` |

---

### Setup

#### 1. Clone the repository

```bash
 git clone https://github.com/YOUR_USERNAME/incident-management-system.git
 cd incident-management-system/incident-dashboard
```

#### 2. Install dependencies

```bash
 pnpm install
```

#### 3. Configure environment variables

Create a `.env` file in the root of the `incident-dashboard` directory with the following content:

```env
 VITE_API_URL=http://localhost:3000
```

#### 4. Start the development server

```bash
 pnpm dev
```

The dashboard will be available at `http://localhost:5173`.

---

## 🧪 Testing

Testing is a **planned feature** for this project. The frontend will soon include:

- **Unit tests** for components and hooks.
- **Component tests** using React Testing Library.
- **Integration tests** for API interactions and user flows.

---

## 📌 Best Practices

- **Feature-based architecture**: Code is organized by domain (e.g., `incidents`).
- **Reusable components**: UI components are modular and typed.
- **CSS Modules**: Styles are scoped to components to avoid global conflicts.
- **Decoupled data access**: Services handle API communication.
- **Strong typing**: TypeScript ensures type safety across the application.

---

## 🛠️ Future Improvements

- **Authentication**: Add user authentication (e.g., JWT).
- **Real-time updates**: Use WebSockets or Server-Sent Events (SSE) for live updates.
- **Dark mode**: Implement a dark/light theme toggle.
- **Advanced filtering**: Add robust filtering and sorting options.
- **Pagination**: Implement pagination for incident lists.

---

## 👤 Author

**Jose A. Cantó (JackDev)**
- GitHub: [@JackDev21](https://github.com/JackDev21)
- LinkedIn: [Jose A. Cantó](https://www.linkedin.com/in/joseaclopez/)
