# Build stage
FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies first for better build caching
COPY package.json package-lock.json* ./
# Use npm cache mount to reduce network requests and allow retries; prefer offline when possible
RUN --mount=type=cache,id=npm,target=/root/.npm \
	npm config set fetch-retry-mintimeout 2000 && \
	npm config set fetch-retry-maxtimeout 60000 && \
	if [ -f package-lock.json ]; then \
		npm ci --prefer-offline --no-audit --legacy-peer-deps || npm install --prefer-offline --no-audit --legacy-peer-deps; \
	else \
		npm install --prefer-offline --no-audit --legacy-peer-deps; \
	fi

# Copy source and build
COPY . .
RUN npm run build

# Production stage
FROM nginx:stable-alpine
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
