# Pentagon Press - Printing Press Management System

A comprehensive **Job Scheduling and Order Management System** for printing press operations built with the MERN stack. This application streamlines printing press workflows by managing orders, scheduling jobs, tracking employees, and providing real-time analytics.

## Features

### Admin Module
- **Dashboard Analytics**: Real-time overview of orders, jobs, and employee performance with Chart.js visualizations
- **Order Management**: Create, track, and manage customer orders through their complete lifecycle
- **Job Scheduling**: Intelligent job scheduling system to optimize printing press operations
- **Employee Management**: Manage employee profiles, roles, and task assignments
- **Admin Profile**: Dedicated admin profile management and settings

### Employee Module
- **Job Schedule Viewer**: View assigned jobs and schedules
- **Task Management**: Track and update job progress

### Customer Features
- **Order Placement**: Easy-to-use order form for customers
- **Product Catalog**: Browse available printing products and services
- **Payment Processing**: Integrated payment handling
- **Order Tracking**: Real-time order status updates

### Additional Features
- **AI Chatbot**: Intelligent chatbot assistance for common queries
- **PDF Generation**: Generate invoices and reports using jsPDF
- **Authentication**: Secure login and route protection
- **Responsive Design**: Bootstrap-based responsive UI

## Tech Stack

### Frontend
- **React** (v18.2.0) - UI library
- **React Router DOM** (v6.20.1) - Client-side routing
- **Bootstrap** (v5.3.3) & React Bootstrap (v2.9.1) - UI framework
- **Chart.js** (v4.4.8) & React Chart.js 2 - Data visualization
- **React Icons** (v4.12.0) - Icon library
- **Sass** (v1.69.5) - CSS preprocessor
- **date-fns** (v2.30.0) - Date utility library

### Backend
- **Node.js** with **Express** (v4.17.1) - Server framework
- **MongoDB** (v6.3.0) with **Mongoose** (v6.0.12) - Database
- **Firebase** (v10.7.1) & Firestore - Real-time database and authentication
- **CORS** (v2.8.5) - Cross-origin resource sharing
- **Body Parser** (v1.19.0) - Request parsing
- **dotenv** (v10.0.0) - Environment configuration

### Document Generation
- **jsPDF** (v3.0.1) - PDF generation
- **jsPDF AutoTable** (v5.0.2) - Table formatting in PDFs
- **@react-pdf/renderer** (v4.3.0) - React-based PDF rendering

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB instance
- Firebase account for authentication and Firestore

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/SreevadhaniG/Printing-press-management.git
   cd Printing-press-management
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
   REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
   REACT_APP_FIREBASE_PROJECT_ID=your_project_id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   REACT_APP_FIREBASE_APP_ID=your_app_id
   MONGODB_URI=your_mongodb_connection_string
   ```

4. **Start the development server**
   ```bash
   npm start
   ```
   The application will open at [http://localhost:3000](http://localhost:3000)

5. **Start the backend server** (in a separate terminal)
   ```bash
   cd server
   node server.js
   ```

### Build for Production

```bash
npm run build
```
