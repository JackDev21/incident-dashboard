# Etapa 1: Construcción (Build)
FROM node:22.22-alpine3.23 AS builder

# Actualizamos los paquetes del sistema operativo para parchear vulnerabilidades (ej. zlib)
RUN apk upgrade --no-cache

# Habilitamos pnpm mediante corepack (incluido en Node 22)
RUN corepack enable && corepack prepare pnpm@latest --activate

# Establecemos el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiamos los archivos de dependencias primero
# Esto es una buena práctica de Docker: aprovecha la caché de capas.
# Si package.json no cambia, Docker no reinstalará las dependencias en cada build.
COPY package.json pnpm-lock.yaml ./

# Instalamos TODAS las dependencias (incluyendo devDependencies como typescript)
RUN pnpm install --frozen-lockfile

# Copiamos el resto del código fuente
COPY . .

# Compilamos el código TypeScript a JavaScript
# Según tu package.json, esto ejecutará 'tsc' y dejará el código en la carpeta /dist
RUN pnpm run build

# Etapa 2: Producción
FROM node:22.22-alpine3.23

# Actualizamos los paquetes del sistema operativo en la imagen final
RUN apk upgrade --no-cache

# Establecemos el directorio de trabajo
WORKDIR /app

# Habilitamos pnpm en la imagen de producción también
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copiamos de nuevo los archivos de dependencias
COPY package.json pnpm-lock.yaml ./

# Instalamos SOLO las dependencias de producción
# Esto reduce drásticamente el tamaño de la imagen final y mejora la seguridad
# al no incluir herramientas de desarrollo (como jest, typescript, etc.)
RUN pnpm install --frozen-lockfile --prod

# Copiamos SOLO el código compilado desde la etapa anterior ('builder')
# No necesitamos el código fuente .ts en producción
COPY --from=builder /app/dist ./dist

# Exponemos el puerto que usa la aplicación
EXPOSE 3000

# Comando para iniciar la aplicación en producción
# Según tu package.json, esto es equivalente a 'npm start'
CMD ["node", "dist/index.js"]
