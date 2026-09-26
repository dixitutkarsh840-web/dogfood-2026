FROM node:20-alpine
WORKDIR /app

# pehle package.json copy karo
COPY package.json ./
RUN npm install || true

# baaki sab copy
COPY . .

EXPOSE 3000
CMD ["node", "server.js"]