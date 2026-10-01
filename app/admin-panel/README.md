# Dev Creation — Admin Panel

Enterprise operations and administration dashboard for **Dev Creation** (orders, inventory, product catalog, customer management, gift cards, and analytics).

## Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Real-Time**: Socket.IO Client
- **Charts / UI**: Recharts, Lucide Icons

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment variables**:
   Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_API_URL=https://devcreation1.onrender.com/api
   NEXT_PUBLIC_SOCKET_URL=https://devcreation1.onrender.com
   NEXT_PUBLIC_STOREFRONT_URL=http://localhost:3000
   ```

3. **Run local development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3001](http://localhost:3001) in your browser.

4. **Production Build**:
   ```bash
   npm run build
   npm start
   ```

## Default Admin Credentials
- **Email**: `admin@devcreation.example`
- **Password**: `Admin@12345`
