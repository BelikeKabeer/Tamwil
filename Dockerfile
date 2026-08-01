FROM nginx:alpine

# Copy your custom nginx routing config
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

# Copy ONLY the contents of your Frontend folder into the web server!
COPY Frontend/ /usr/share/nginx/html/

EXPOSE 80
