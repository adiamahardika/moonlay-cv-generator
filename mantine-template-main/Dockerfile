# Frontend Dockerfile (in the /moonlayhr directory)
FROM node:18-alpine

# Set work directory
WORKDIR /app

# Copy package.json and yarn.lock, then install dependencies
COPY package.json yarn.lock ./
RUN yarn install

# Copy the rest of the application files
COPY . .

# Build the Vite app for production
RUN yarn build

# Expose port 5173
EXPOSE 5173

# Command to run the app
CMD ["yarn", "dev"]
