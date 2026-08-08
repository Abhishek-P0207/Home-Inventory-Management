# Easy Inventory

A modern, React-based inventory management system with Automatic Items extraction from Invoices using AI.

## Features

- Real-Time Overview Dashboard
- Quick Search and Filter
- Low Stock Detection and Alerts 
- AI Powered Invoice Parsing
- Invoice Draft Review and Approval Workflow
- Secure Cloud Storage for Uploaded Invoices
- Inventory Trend Analysis
- JWT-Based Authentication and Authorization

## Tech Stack

- Frontend: React + Vite
- Backend: Express.js
- Database: MongoDB
- Invoice Storage: Multer & AWS S3 SDK
- AI Invoice Parsing: Google Gen AI SDK


## Installation Guide

### Prerequisites
- Node.js
- pnpm
- MongoDB
- AWS S3 Bucket
- Google Gemini API Key


### Step 1: Clone the Repository
```bash
git clone https://github.com/Abhishek-P0207/Home-Inventory-Management.git
cd Home-Inventory-Management
```


### Step 2: Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install backend dependencies:
   ```bash
   pnpm install
   ```

3. Create a `.env` file in the `backend/` directory (refer to `.env.example`):
   ```env
   PORT=3000
   DATABASE_URL=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRES_IN=24h

   # Google Gemini API Key
   GEMINI_API_KEY=your_gemini_api_key

   # AWS S3 Credentials
   AWS_REGION=your_aws_region
   AWS_S3_BUCKET=your_s3_bucket_name
   AWS_ACCESS_KEY_ID=your_aws_access_key_id
   AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
   ```

4. Start the backend development server:
   ```bash
   pnpm run dev
   ```
   The backend server will run on `http://localhost:3000`.


### Step 3: Frontend Setup

1. Open a new terminal window and navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install frontend dependencies:
   ```bash
   pnpm install
   ```

3. Start the Vite development server:
   ```bash
   pnpm run dev
   ```
   The application will be accessible at `http://localhost:5173`.