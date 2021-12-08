# FROM nginx:alpine
# WORKDIR /app
# COPY build ./

FROM node:12
WORKDIR /app
COPY build build/
RUN npm install serve -g
CMD serve -p 3101