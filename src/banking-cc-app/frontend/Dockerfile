FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

ENV PORT=5173
EXPOSE 5173

# Dev-server mode keeps this scaffold simple to run and iterate on.
# For a production image, run `npm run build` and serve dist/ with nginx instead.
CMD ["npm", "run", "dev"]
