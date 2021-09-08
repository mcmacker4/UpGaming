FROM nginx:mainline-alpine

COPY index.html /usr/share/nginx/html/
COPY js /usr/share/nginx/html/js