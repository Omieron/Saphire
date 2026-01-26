# Saphire Project Deep Dive Documentation

This document provides a detailed technical overview of the Saphire system, covering Backend, Mobile, and Admin Console components.

## 1. Backend Architecture (`Saphire-Backend`)

The backend is built with **Java 17** and **Spring Boot 3**, using a PostgreSQL database with Flyway for migrations.

### Core Entities & Database Schema

#### Master Data
- **UserEntity**: Manages authentication and roles (`ADMIN`, `SUPERVISOR`, `OPERATOR`). Also stores many-to-many relationship with `MachineEntity` for machine authorization.
- **MachineEntity**: Represents production machines. Stores location, status, and authorized operators.
- **ProductEntity**: Definitions for products including codes and basic metadata.
- **LocationEntity**: Physical plant locations (Lines, Areas).
- **CompanyEntity**: Multi-tenant support structure.

#### Quality Control (QC) System
- **QcFormTemplateEntity**: The blueprint for a QC check. Contains metadata and is linked to multiple `QcFormSectionEntity`.
- **QcFormSectionEntity**: Groups related fields. Can be marked as `isRepeatable` for multi-sample checks.
- **QcFormFieldEntity**: Individual input definition (label, unit, input type, tolerances).
- **QcFormHeaderFieldEntity**: Static fields required at the start of a form (e.g., Lot Number).
- **QcFormRecordEntity**: The result of a submitted QC form.
- **QcFormValueEntity**: Individual values captured for each field in a record.

#### Assignment & Scheduling
- **TaskAssignmentEntity**: Links a `QcFormTemplate` to specific users, a machine, and/or a product.
- **TaskScheduleEntity**: Defines when a task is active (Day of week, Start/End time).

### API Layer (REST Controllers)
- `AuthController`: JWT-based login/me endpoints.
- `UserController`: CRUD for users and machine assignments.
- `QcFormTemplateController`: Complex builder logic for QC forms.
- `TaskAssignmentController`: Manages distribution of QC tasks to operators.
- `QcFormRecordController`: Handling submissions from mobile and approval flows.

---

## 2. Mobile Application (`Saphire-Mobile`)

Developed with **React Native (Web-compatible)** using Vite, Tailwind CSS, and Lucide Icons.

### State Management & Contexts
- **AuthContext**: Manages JWT tokens, user profile, and `machineIds` for local filtering.
- **LanguageContext**: multi-language support (TR/EN).
- **ThemeContext**: Handles "Premium Dark/Light" aesthetics.

### Key Pages & Logic
- **Dashboard**: 
  - Fetches active tasks for the logged-in user via `TaskAssignmentController`.
  - Filters displayed machines based on `user.machineIds`.
  - Calculates "Time Remaining" for tasks based on `TaskSchedule`.
- **QcEntry**:
  - Dynamically renders forms based on the `QcFormTemplate` fetched.
  - Handles **Partial Saving** to local storage to prevent data loss.
  - Supports **Repeatable Sections** for sample collections.
  - Implements **Grace Period** logic for late submissions.
- **History**: Localized view of previously submitted and approved/rejected records.

---

## 3. Admin Console (`Saphire-Admin_Console`)

Built with **React 18** and **Tailwind CSS**, focused on a highly premium management experience.

### Key Features
- **User Management**: Integrated machine assignment UI with search and tags.
- **Template Builder**: A complex, recursive UI for building multi-section QC forms with live mobile previews.
- **Task Scheduler**: Visual interface for creating `RECURRING` or `ONCE` task assignments.
- **QC Approval Queue**: Specialized UI for supervisors to review `Pending` records with DIFF-like field comparisons.

---

## 4. Workflows & Security
- **Authentication**: JWT based. `X-User-Id` header used for backend tracking.
- **Authorization**: Role-based access control (RBAC) on both frontend and backend.
- **Machine Safety**: Operators can only see and submit forms for machines they are explicitly authorized for in the Backend.
