FROM node:18-alpine

WORKDIR /app

RUN apk update && apk add --no-cache \
    g++ \
    gcc \
    make \
    python3 \
    openjdk17

COPY package*.json ./
RUN npm install

COPY . .

RUN mkdir -p ./services/codes ./services/inputs ./services/outputs

EXPOSE 5001

CMD ["npm", "start"]
