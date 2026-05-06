# Build stage
FROM node:20-alpine AS builder
WORKDIR /app

# Copy root workspace files
COPY package.json package-lock.json ./
COPY apps/admin/package.json ./apps/admin/
COPY packages/shared/package.json ./packages/shared/

# Install dependencies
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build -w apps/admin

# Production stage
FROM nginx:alpine
COPY --from=builder /app/apps/admin/dist /usr/share/nginx/html
# Add a custom nginx config if needed to handle client-side routing
RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
