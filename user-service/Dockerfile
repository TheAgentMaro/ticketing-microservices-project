FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
COPY tsconfig.json ./
COPY .env ./
COPY swagger.yaml ./
COPY types.d.ts ./

RUN npm install

# Copier tous les fichiers TS au niveau racine et dans les sous-dossiers
COPY *.ts ./
COPY controllers/ ./controllers/
COPY models/ ./models/
COPY routes/ ./routes/
COPY services/ ./services/ 
COPY config/ ./config/
COPY utils/ ./utils/
COPY middleware/ ./middleware/
COPY tests/ ./tests/

RUN npm run build
EXPOSE 3003
CMD ["npm", "start"]