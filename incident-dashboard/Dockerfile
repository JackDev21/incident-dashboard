# Etapa 1: Construcción (Build)
FROM node:22.14.0-alpine3.21 AS builder

# Actualizamos los paquetes del sistema operativo para parchear vulnerabilidades
RUN apk upgrade --no-cache

WORKDIR /app

# Copiamos los archivos de dependencias
COPY package*.json ./

# Instalamos todas las dependencias necesarias para compilar
RUN npm ci

# Copiamos el resto del código fuente
COPY . .

# Compilamos la aplicación React/Vite
# Según tu package.json, esto ejecuta 'tsc -b && vite build'
# El resultado se guardará en la carpeta /dist
RUN npm run build

# Etapa 2: Servidor Web (Producción)
# Usamos Nginx, que es un servidor web ultrarrápido y ligero, ideal para servir archivos estáticos
FROM nginx:1.27.4-alpine3.21

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
