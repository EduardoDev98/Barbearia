# Build
FROM node:20-alpine AS build
WORKDIR /app
ARG VITE_API_URL
ARG VITE_NOME_BARBEARIA
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_NOME_BARBEARIA=$VITE_NOME_BARBEARIA
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Serve
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
