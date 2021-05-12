FROM nginx:stable-alpine

RUN rm -rf /usr/share/nginx/html/*

COPY ./dist/qr-bill-generator /usr/share/nginx/html/
COPY ./nginx-custom.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]