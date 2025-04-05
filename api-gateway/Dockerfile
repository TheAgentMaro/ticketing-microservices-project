# Image de base Node.js
FROM node:18-alpine

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de configuration
COPY package*.json ./
COPY tsconfig.json ./
COPY .env ./

# Installer les dépendances
RUN npm install

# Copier le code source
COPY src/ ./src/
COPY *.ts ./

# Compiler TypeScript
RUN npm run build

RUN ls -la src/ && npm run build && ls -la dist/

# Exposer le port
EXPOSE 3000

# Commande pour démarrer l'application
CMD ["npm", "start"]