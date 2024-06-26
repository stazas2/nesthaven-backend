# Используем образ node:20 как основу
FROM node:20

# Создаем рабочую директорию внутри контейнера
WORKDIR /app

# Копируем package.json и package-lock.json в рабочую директорию
COPY package*.json ./

# Устанавливаем зависимости проекта с помощью npm
RUN npm install

# Установка необходимых пакетов для установки Google Cloud SDK
RUN apt-get update && \
    apt-get install -y curl gnupg lsb-release

# Установка и настройка ключа для Google Cloud SDK
RUN export CLOUD_SDK_REPO="cloud-sdk-$(lsb_release -c -s)" && \
    echo "deb http://packages.cloud.google.com/apt $CLOUD_SDK_REPO main" | tee -a /etc/apt/sources.list.d/google-cloud-sdk.list && \
    curl https://packages.cloud.google.com/apt/doc/apt-key.gpg | apt-key add -

# Установка Google Cloud SDK
RUN apt-get update && \
    apt-get install -y google-cloud-sdk

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
