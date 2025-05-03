FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install --only=production
COPY . .

FROM node:22-alpine
WORKDIR /app
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package*.json ./package*.json
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
