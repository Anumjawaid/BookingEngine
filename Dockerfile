# Use a slim Node.js 20 image as the base
FROM node:20-slim

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package files first (optimizes build caching)
COPY package*.json ./

# Install production and dev dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port your Express app runs on
EXPOSE 5000

# The command to run the app
CMD ["npm", "run", "dev"]