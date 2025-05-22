FROM node:18

# Set work directory
WORKDIR /app

# Enable Corepack
RUN corepack enable && corepack prepare yarn@stable --activate

# Copy package.json and yarn.lock, then install dependencies
COPY package.json yarn.lock ./

RUN rm -rf node_modules

RUN yarn cache clean && npm cache clean --force

RUN yarn

RUN npm i --force

# Copy the rest of the application files
COPY . .

# Build the Vite app for production
RUN yarn build

# Expose port 5173
EXPOSE 5173

# Command to run the app
CMD ["yarn", "start"]
