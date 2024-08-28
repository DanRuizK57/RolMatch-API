FROM node:latest
WORKDIR /usr/src/sport-time/api-user
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "start:prod"]
