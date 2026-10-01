# Dev Creation — Next.js Storefront

Customer-facing e-commerce storefront for **Dev Creation** (handcrafted luxury wax sachets, candles, aroma stones, and gift sets).

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
   ```

3. **Run local development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

4. **Production Build**:
   ```bash
   npm run build
   npm start
   ```
