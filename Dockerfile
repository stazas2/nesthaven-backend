# Используем образ с Google Cloud SDK
FROM google/cloud-sdk

# Используем node:20 как основу
FROM node:20

# Создаем рабочую директорию внутри контейнера
WORKDIR /app

# Копируем package.json и package-lock.json в рабочую директорию
COPY package*.json ./

# Устанавливаем зависимости проекта с помощью npm
RUN npm install

# Копируем все файлы проекта в рабочую директорию
COPY . .

# Копируем credentials.json в контейнер
COPY credentials.json /app/credentials.json

# Устанавливаем переменную окружения для указания проекта Google Cloud
ENV GOOGLE_CLOUD_PROJECT="causal-sky-426707-u3"

# Аутентифицируемся в Google Cloud с помощью сервисного аккаунта
RUN gcloud auth activate-service-account --key-file=/app/credentials.json

# Открываем порт, на котором будет работать приложение (по умолчанию 1337)
EXPOSE 1337

# Запускаем приложение с помощью npm
CMD ["npm", "run", "server"]
