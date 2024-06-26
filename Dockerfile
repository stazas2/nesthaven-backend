# Используем официальный образ Node.js в качестве базового
FROM node:20

# Создаем рабочую директорию внутри контейнера
WORKDIR /app

# Копируем package.json и package-lock.json в рабочую директорию
COPY package*.json ./

# Устанавливаем зависимости проекта с помощью npm
RUN npm install && \
    apt-get update && \
    apt-get install -y google-cloud-sdk

# Копируем все файлы проекта в рабочую директорию
COPY . .

# Копируем credentials.json в контейнер
COPY credentials.json /app/credentials.json

# Аутентифицируемся в Google Cloud с помощью сервисного аккаунта
RUN gcloud auth activate-service-account --key-file=/app/credentials.json

# Открываем порт, на котором будет работать приложение (по умолчанию 1337)
EXPOSE 1337

# Запускаем приложение с помощью nodemon
CMD ["npm", "run", "server"]
