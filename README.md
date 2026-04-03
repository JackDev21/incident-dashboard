# Incident Management System

This repository contains a **full-stack Incident Management System** composed of two main projects:

1. **`incident-api`**: A backend service built with Node.js, Express, and MongoDB to manage incident data.
2. **`incident-dashboard`**: A frontend application built with React, TypeScript, and Vite to visualize and manage incidents.

---

## 🚀 Overview

This system allows users to:
- **Create, read, update, and delete incidents** via a RESTful API.
- **Visualize and manage incidents** through a modern, responsive dashboard.
- **Filter and view incident details** in a user-friendly interface.

The architecture follows **best practices** for scalability, maintainability, and separation of concerns.

---

## 📁 Project Structure

```txt
/
├── incident-api/          # Backend service (Node.js + Express + MongoDB)
├── incident-dashboard/    # Frontend application (React + TypeScript + Vite)
└── README.md              # Project documentation (this file)
```

---

## 🛠️ Technologies

### Backend (`incident-api`)
- **Runtime**: Node.js
- **Framework**: Express
- **Database**: MongoDB (Mongoose ODM)
- **Language**: TypeScript
- **Development Tools**: `ts-node-dev`, `TypeScript`, `dotenv`, `cors`

### Frontend (`incident-dashboard`)
- **Framework**: React
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: SCSS + CSS Modules
- **State Management**: React Query
- **Routing**: React Router DOM
- **UI Components**: Lucide React (icons)
- **Package Manager**: pnpm

---

## 🔗 Architecture & Data Flow

The system follows a **decoupled architecture** where the frontend communicates with the backend via a RESTful API.

```mermaid
 graph LR
   A[Frontend (incident-dashboard)] -->|HTTP Requests| B[Backend (incident-api)]
   B -->|CRUD Operations| C[MongoDB]
```

### Data Flow
1. The **frontend** sends HTTP requests to the **backend API**.
2. The **backend** processes the requests, interacts with the **database**, and returns responses.
3. The **frontend** displays the data and allows users to interact with it.

### API Endpoints

The backend exposes the following endpoints for incident management:

| Method | Endpoint         | Description                  |
| ------ | ---------------- | ---------------------------- |
| GET    | `/incidents`     | Retrieve all incidents       |
| GET    | `/incidents/:id` | Retrieve a specific incident |
| POST   | `/incidents`     | Create a new incident        |
| PUT    | `/incidents/:id` | Update an existing incident  |
| DELETE | `/incidents/:id` | Delete an incident           |

For more details, check the [Backend README](./incident-api/README.md).

---

## 📂 Domain Model

### Incident

An **incident** represents an issue that needs to be tracked and resolved. It has the following properties:

| Field         | Type               | Description                                       |
| ------------- | ------------------ | ------------------------------------------------- |
| `id`          | `string`           | Unique identifier                                 |
| `title`       | `string`           | Short description of the incident                 |
| `description` | `string`           | Detailed description                              |
| `status`      | `IncidentStatus`   | Current state (`open`, `in progress`, `resolved`) |
| `priority`    | `IncidentPriority` | Severity level (`low`, `medium`, `high`)          |
| `assignee`    | `string`           | Person responsible for the incident               |
| `createdAt`   | `Date`             | When the incident was created                     |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v20 or later)
- **pnpm** (v9 or later)
- **MongoDB** (running locally or via a cloud service like MongoDB Atlas)

### Environment Variables

#### Backend (`incident-api`)
| Variable      | Description                 | Example                                 |
| ------------- | --------------------------- | --------------------------------------- |
| `PORT`        | Port for the backend server | `3000`                                  |
| `MONGODB_URI` | URI for MongoDB connection  | `mongodb://localhost:27017/incident_db` |

#### Frontend (`incident-dashboard`)
| Variable       | Description            | Example                 |
| -------------- | ---------------------- | ----------------------- |
| `VITE_API_URL` | URL of the backend API | `http://localhost:3000` |

---

### Setup

#### 1. Clone the repository

```bash
 git clone https://github.com/YOUR_USERNAME/incident-management-system.git
 cd incident-management-system
```

#### 2. Set up the Backend (`incident-api`)

```bash
 cd incident-api
 pnpm install
```

Create a `.env` file in the `incident-api` directory with the following content:

```env
 PORT=3000
 MONGODB_URI=mongodb://localhost:27017/incident_db
```

Start the backend:

```bash
 pnpm dev
```

The API will be available at `http://localhost:3000`.

For more details, check the [Backend README](./incident-api/README.md).

---

#### 3. Set up the Frontend (`incident-dashboard`)

```bash
 cd ../incident-dashboard
 pnpm install
```

Create a `.env` file in the `incident-dashboard` directory with the following content:

```env
 VITE_API_URL=http://localhost:3000
```

Start the frontend:

```bash
 pnpm dev
```

The dashboard will be available at `http://localhost:5173`.

For more details, check the [Frontend README](./incident-dashboard/README.md).

---

## 🧪 Testing

Testing is a **planned feature** for this project. Both the **backend** and **frontend** will soon include:

### Backend (`incident-api`)
- **Unit tests** for controllers and services.
- **Integration tests** for API endpoints.
- **Test coverage** to ensure reliability.

### Frontend (`incident-dashboard`)
- **Unit tests** for components and hooks.
- **Component tests** using React Testing Library.
- **Integration tests** for API interactions and user flows.

---

## 📌 Best Practices

### Backend
- **Separation of concerns**: Routes, controllers, and models are decoupled.
- **Type safety**: TypeScript is used for all layers.
- **RESTful design**: API follows REST conventions.
- **Environment variables**: Sensitive configuration is managed via `.env`.

### Frontend
- **Feature-based architecture**: Code is organized by domain (e.g., `incidents`).
- **Reusable components**: UI components are modular and typed.
- **CSS Modules**: Styles are scoped to components.
- **Decoupled data access**: Services handle API communication.
- **Strong typing**: TypeScript ensures type safety across the application.

---

## 🛠️ Future Improvements

- **Authentication**: Add user authentication (e.g., JWT).
- **Real-time updates**: Use WebSockets or Server-Sent Events (SSE) for live updates.
- **Advanced filtering**: Implement more robust filtering and sorting in the dashboard.
- **Pagination**: Add pagination to the API and dashboard.
- **Dark mode**: Implement a dark/light theme toggle.

---

## 👤 Author

**Jose A. Cantó (JackDev)**
- GitHub: [@JackDev21](https://github.com/JackDev21)
- LinkedIn: [Jose A. Cantó](https://www.linkedin.com/in/joseaclopez/)