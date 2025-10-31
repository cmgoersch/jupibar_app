FROM nginx:alpine
COPY src/* /usr/share/nginx/html/
EXPOSE 80
ADD dockerstart.sh /usr/local/bin
RUN chmod +x /usr/local/bin/dockerstart.sh
CMD ["dockerstart.sh"]
