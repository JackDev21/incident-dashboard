# Etapa 1: Construcción (Build)
FROM node:22.22-alpine3.23 AS builder

# Actualizamos los paquetes del sistema operativo para parchear vulnerabilidades
RUN apk upgrade --no-cache

# Habilitamos pnpm mediante corepack (incluido en Node 22)
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copiamos los archivos de dependencias
COPY package.json pnpm-lock.yaml ./

# Instalamos todas las dependencias necesarias para compilar
RUN pnpm install --frozen-lockfile

# Copiamos el resto del código fuente
COPY . .

# Variable de entorno para la URL de la API (se quema en el build estático)
# El valor se inyecta desde docker-compose.yml (que lo lee del .env raíz)
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Compilamos la aplicación React/Vite
# Según tu package.json, esto ejecuta 'tsc -b && vite build'
# El resultado se guardará en la carpeta /dist
RUN pnpm run build

# Etapa 2: Servidor Web (Producción)
# Usamos Nginx, que es un servidor web ultrarrápido y ligero, ideal para servir archivos estáticos
FROM nginx:1.28.3-alpine3.23

# Actualizamos los paquetes del sistema operativo en la imagen final
RUN apk upgrade --no-cache

# Copiamos los archivos estáticos compilados desde la etapa 'builder'
# Vite por defecto genera los archivos en la carpeta /dist
# Los colocamos en la carpeta por defecto donde Nginx busca los archivos para servir
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiamos una configuración personalizada de Nginx (la crearemos a continuación)
# Esto es crucial para que React Router funcione correctamente (Single Page Application)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exponemos el puerto 80 (el puerto por defecto de HTTP)
EXPOSE 80

# Iniciamos Nginx en primer plano
CMD ["nginx", "-g", "daemon off;"]
