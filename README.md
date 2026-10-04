# CloudMart Frontend — Microservices E-Commerce Application

A clean, beginner-friendly **React + Vite** frontend for an e-commerce microservices architecture.

> **CRITICAL SETUP NOTE:**  
> The backend services run on a **DIFFERENT LAPTOP** on your local network (LAN / Wi-Fi).  
> **NEVER** use `localhost` for backend URLs from the frontend laptop. All backend URLs are loaded dynamically through environment variables in `.env`.

---

## Architecture Overview

The system consists of **4 independent backend microservices** running on a separate host laptop, communicating with this React single-page application:

```
[ Frontend Laptop: React + Vite (Port 3000) ]
                      │
   ═══════════════════╪═════════════════════════════════════════════
     Local Wi-Fi / LAN Network (e.g., 192.168.1.20)
   ═══════════════════╪═════════════════════════════════════════════
                      │
   ┌──────────────────┼──────────────────┬──────────────────┐
   ▼                  ▼                  ▼                  ▼
[ Auth Service ]   [ Product Service ] [ Order Service ]  [ Payment Service ]
  Port: 5001         Port: 5002          Port: 5003         Port: 5004
```

---

## 1. Requirements

Before running the application, make sure your frontend machine has:

- **Node.js**: v18.0.0 or later (Node 20+ recommended)
- **npm**: v9.0.0 or later
- **Web Browser**: Modern browser (Chrome, Edge, Firefox, Brave, Safari)
- **Local Network**: Both frontend and backend laptops **must be connected to the same Wi-Fi router or LAN network**.

---

## 2. Installation & Setup

Navigate into the `frontend` folder:

```bash
cd frontend
```

---

## 3. Installing Dependencies (`npm install`)

Install the required packages (`react`, `react-dom`, `react-router-dom`, `vite`):

```bash
npm install
```

---

## 4. Environment Variables Configuration (`.env`)

Vite reads environment variables prefixed with `VITE_`.

1. Copy the `.env.example` file to create your active `.env`:
   ```bash
   cp .env.example .env
   ```
   *(On Windows Command Prompt: `copy .env.example .env`)*

2. Open `.env` and set the IP address of your backend laptop:
   ```env
   # Replace 192.168.1.20 with the actual IP address of the backend laptop
   VITE_AUTH_API_URL=http://192.168.1.20:5001
   VITE_PRODUCT_API_URL=http://192.168.1.20:5002
   VITE_ORDER_API_URL=http://192.168.1.20:5003
   VITE_PAYMENT_API_URL=http://192.168.1.20:5004
   ```

3. **Security Rule**: The `.env` file is ignored by Git in `.gitignore`. Never commit `.env` into version control.

---

## 5. How to Find the Backend Laptop's IP Address

On the **backend laptop**, open a terminal/command prompt to retrieve its local LAN IP address:

### On Windows (Backend Laptop):
```cmd
ipconfig
```
Look for **Wireless LAN adapter Wi-Fi** or **Ethernet adapter**, and find:
```text
IPv4 Address. . . . . . . . . . . : 192.168.1.20
```

### On macOS (Backend Laptop):
```bash
ipconfig getifaddr en0
```
*(Or check `System Settings` → `Network` → `Wi-Fi` → `Details`)*

### On Linux (Backend Laptop):
```bash
hostname -I
# or
ip addr show | grep inet
```

---

## 6. How to Test Backend Connectivity Before Starting React

Before launching the frontend, verify that the frontend laptop can actually reach the backend laptop over the local network.

Open a web browser or terminal on your **frontend laptop** and test each service endpoint:

```bash
# Test Auth Service
curl http://<BACKEND_IP>:5001/api/auth/me
# Or in browser: http://<BACKEND_IP>:5001/health

# Test Product Service
curl http://<BACKEND_IP>:5002/api/products
# Or in browser: http://<BACKEND_IP>:5002/api/products

# Test Order Service
curl http://<BACKEND_IP>:5003/api/orders
# Or in browser: http://<BACKEND_IP>:5003/health

# Test Payment Service
curl http://<BACKEND_IP>:5004/api/payments
# Or in browser: http://<BACKEND_IP>:5004/health
```

> ⚠️ **Troubleshooting If Unreachable:**  
> If the browser gives a "Connection Timed Out" or "Unable to connect" error, **the issue is networking/firewall and NOT React**.  
> Check:
> 1. Is the backend laptop firewall blocking incoming ports 5001, 5002, 5003, 5004?
> 2. Are both laptops connected to the exact same Wi-Fi SSID?
> 3. Does the Wi-Fi router enable "AP/Client Isolation" (preventing devices from communicating with each other)?

---

## 7. How to Start the React Application

Start the local Vite development server:

```bash
npm run dev
```

You will see output similar to:
```text
  VITE v5.4.6  ready in 240 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: http://192.168.1.15:3000/
```

Open your browser at `http://localhost:3000`.

---

## 8. How Authentication Works

1. **Registration** (`POST /api/auth/register` on Port 5001):
   - The user fills out Name, Email, Password, Confirm Password.
   - Upon registration, if the backend returns a JWT, the user is authenticated immediately.
2. **Login** (`POST /api/auth/login` on Port 5001):
   - The user submits Email and Password.
   - The Auth Service validates credentials and returns a JWT (`token`).
3. **Token Storage**:
   - The JWT is stored in browser `localStorage.setItem('token', token)`.
   - Basic user profile information is stored in `localStorage.setItem('user', JSON.stringify(user))`.
4. **Auth Context**:
   - `AuthContext.jsx` maintains global authentication state (`user`, `token`, `isAuthenticated`).
   - When the user logs in, `AuthContext` updates, triggering re-renders across the app.
   - On logout, `authService.clearAuth()` deletes tokens from `localStorage` and resets context state.
5. **Route Protection**:
   - Protected routes (`/cart`, `/orders`, `/orders/:id`, `/payment/:orderId`, `/profile`) are wrapped with `<ProtectedRoute>`.
   - If an unauthenticated user visits a protected URL, they are automatically redirected to `/login` with return-location memory.

---

## 9. How API Calls & JWT Authorization Work

All network requests go through the centralized request client in `src/config/api.js`:

```javascript
// src/config/api.js
export const API = {
  AUTH: import.meta.env.VITE_AUTH_API_URL,
  PRODUCT: import.meta.env.VITE_PRODUCT_API_URL,
  ORDER: import.meta.env.VITE_ORDER_API_URL,
  PAYMENT: import.meta.env.VITE_PAYMENT_API_URL
};
```

### Reusable Request Helper (`apiRequest`)
Whenever an authenticated request is made:
1. `apiRequest` retrieves the JWT token from `localStorage.getItem('token')`.
2. It automatically attaches the header:
   ```http
   Authorization: Bearer <JWT_TOKEN>
   ```
3. It sets `Content-Type: application/json`.
4. If a 401 Unauthorized status is returned (token expired), it automatically cleans up the session and alerts the user:
   > *"Your session has expired. Please login again."*

---

## 10. How the Frontend Communicates with the 4 Backend Services

The application structure separates services into dedicated modules in `src/services/`:

| Service | File | Port | Key Endpoints | Responsibilities |
|---|---|---|---|---|
| **Auth** | `authService.js` | `5001` | `POST /api/auth/register`<br>`POST /api/auth/login`<br>`GET /api/auth/me` | Handles identity, token issuance, user verification |
| **Product** | `productService.js` | `5002` | `GET /api/products`<br>`GET /api/products/:id` | Catalogs items, prices, inventory levels |
| **Order** | `orderService.js` | `5003` | `POST /api/orders`<br>`GET /api/orders`<br>`GET /api/orders/:id` | Creates purchase records, attaches items list with JWT |
| **Payment** | `paymentService.js` | `5004` | `POST /api/payments` | Simulated payment processing (`orderId`, `userId`, `amount`) |

---

## 11. Common CORS (Cross-Origin Resource Sharing) Errors

### Why Does CORS Happen?
Your frontend runs at `http://localhost:3000` (or `http://FRONTEND_IP:3000`), while the backend services run at `http://BACKEND_IP:5001-5004`.  
Because the **origins differ** (different port or IP), web browsers block the response unless the backend explicitly permits it via HTTP headers.

### How to Fix CORS on the Backend:
The backend microservices must include CORS headers.

**For Express.js (Node.js backend):**
```javascript
const cors = require('cors');

app.use(cors({
  origin: '*', // Or specify your frontend origin: 'http://192.168.1.15:3000'
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

**For Flask / FastAPI (Python backend):**
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

> ⚠️ **DO NOT USE `mode: "no-cors"`**:  
> Setting `mode: "no-cors"` makes the response "opaque" in JavaScript, meaning React will not be able to read JSON data returned by the backend.

---

## 12. Common Network Errors & Troubleshooting

| Error Symptom | Cause | Solution |
|---|---|---|
| `TypeError: Failed to fetch` | Backend server not running, or wrong IP address | Verify backend service is running; check `.env` IP address |
| `ERR_CONNECTION_REFUSED` | Service is offline or port number is incorrect | Ensure microservice process is listening on the assigned port |
| `ERR_CONNECTION_TIMED_OUT` | Firewall is blocking incoming traffic | Open ports 5001-5004 in Windows Defender / UFW firewall on the backend laptop |
| Devices cannot ping each other | Wi-Fi Client Isolation is active on router | Connect both laptops via mobile hotspot or disable "AP Isolation" in router settings |
| `HTTP 401 Unauthorized` | Missing or expired JWT token | Log in again through the Login page |
| `HTTP 404 Not Found` | Endpoint path mismatch (e.g. `/products` vs `/api/products`) | Check backend routes against the service endpoints |

---

## 13. How to Change the Backend IP Address

When you switch Wi-Fi networks (e.g., moving between college lab, home, or mobile hotspot), your backend laptop's IP address will change.

Follow these 3 simple steps to update:

1. On the **backend laptop**, run `ipconfig` (Windows) or `hostname -I` (Linux) to find the new IP (e.g., `192.168.1.45`).
2. On the **frontend laptop**, open `frontend/.env` and update the IP:
   ```env
   VITE_AUTH_API_URL=http://192.168.1.45:5001
   VITE_PRODUCT_API_URL=http://192.168.1.45:5002
   VITE_ORDER_API_URL=http://192.168.1.45:5003
   VITE_PAYMENT_API_URL=http://192.168.1.45:5004
   ```
3. Restart the Vite dev server so the new environment variables take effect:
   - Press `Ctrl + C` in the frontend terminal.
   - Run `npm run dev`.

---

## 14. Docker & AWS Deployment Notes

A production-ready `Dockerfile` with a multi-stage build is included:

```dockerfile
# Stage 1: Build React static assets with Vite
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Important Notice for AWS ECS Deployment:
- **Never put ECS Service Connect private names** (such as `http://product-service:5002`) inside frontend React code.
- Why? **The client's web browser runs on the user's laptop**, outside the private AWS VPC. The browser cannot resolve private AWS Cloud Map / ECS Service Connect hostnames.
- In production on AWS, browser API calls should point to an **AWS Application Load Balancer (ALB)** or **Amazon API Gateway** with a public DNS domain, while ECS Service Connect handles internal service-to-service communication.
