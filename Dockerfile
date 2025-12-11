FROM node:18-alpine

WORKDIR /app

# Копируем зависимости
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install --legacy-peer-deps

# Копируем исходный код
COPY . .

# Создаем .env файл
RUN echo "REACT_APP_API_URL=http://localhost:8000" > .env

EXPOSE 3000

CMD ["npm", "start"]