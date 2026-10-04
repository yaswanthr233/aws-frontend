# =========================================================================
# Stage 1: Build React/Vite Application
# =========================================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json* ./
RUN npm install

# Copy application source code
COPY . .

# Accept build arguments for Vite environment variables
# Note: In production AWS deployment, point these to your public API Gateway or ALB endpoint
ARG VITE_AUTH_API_URL
ARG VITE_PRODUCT_API_URL
ARG VITE_ORDER_API_URL
ARG VITE_PAYMENT_API_URL

ENV VITE_AUTH_API_URL=$VITE_AUTH_API_URL
ENV VITE_PRODUCT_API_URL=$VITE_PRODUCT_API_URL
ENV VITE_ORDER_API_URL=$VITE_ORDER_API_URL
ENV VITE_PAYMENT_API_URL=$VITE_PAYMENT_API_URL

# Build production bundle into /app/dist
RUN npm run build

# =========================================================================
# Stage 2: Serve Production Assets with Nginx
# =========================================================================
FROM nginx:alpine

# Copy custom Nginx configuration supporting React Router SPA fallback
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy compiled static assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80 for HTTP traffic
EXPOSE 80

# Start Nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
