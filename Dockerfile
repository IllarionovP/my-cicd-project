FROM nginx:alpine
# Копируем всё содержимое папки site внутрь контейнера Nginx
COPY site/ /usr/share/nginx/html/



