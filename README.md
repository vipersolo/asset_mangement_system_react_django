# ASSET_CORE - Asset Management System

A full-stack asset management platform built with Django REST Framework and React. The system helps organizations manage hardware assets, consumable inventory, employee assignments, and repair workflows through role-based access control.

## Features

### Authentication & Authorization

* JWT Authentication using SimpleJWT
* Role-Based Access Control (RBAC)
* Protected frontend routes and backend APIs
* Separate interfaces for Admins, Technicians, and Employees

### Admin Dashboard

* Register and manage hardware assets
* Track asset details including serial numbers and condition
* Manage consumable inventory
* Receive low-stock alerts for consumables
* Assign assets to employees
* View system-wide analytics and asset statistics

### Technician Dashboard

* View assigned repair tickets
* Update ticket status:

  * Pending
  * In Progress
  * Completed
* Track repair history and progress

### Employee Portal

* View assigned assets
* Check asset details and status
* Submit repair requests
* Track repair ticket progress

## Tech Stack

### Frontend

* React
* React Router DOM
* React Bootstrap
* Bootstrap Icons
* Axios

### Backend

* Django
* Django REST Framework
* SimpleJWT
* Django CORS Headers

### Database

* PostgreSQL
* SQLite (Development)

## System Design

* Role-based access control across frontend and backend
* RESTful API architecture using Django REST Framework
* Automatic asset status updates during assignment workflows
* Validation rules implemented at the model level to ensure data integrity

## Live Demo

Frontend:
https://asset-management-frontend-react.onrender.com

Backend API:
https://asset-mangement-system-react-django.onrender.com

## Screenshots


## Installation

### Prerequisites

* Python 3.10+
* Node.js 18+
* PostgreSQL

### Backend Setup

```bash
cd asset_core_backend

python -m venv venv

# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate

pip install -r requirements.txt

python manage.py migrate

python manage.py createsuperuser

python manage.py runserver
```

Backend will run at:

```text
http://127.0.0.1:8000
```

### Frontend Setup

```bash
cd asset_core_frontend

npm install

npm run dev
```

Frontend will run at:

```text
http://localhost:5173
```

## Future Improvements

* Email notifications
* Asset QR code generation
* Audit logs for asset activities
* Advanced reporting and analytics
* Export reports to PDF and Excel

```
```
