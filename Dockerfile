# Use the official Node.js 20 image (slim for smaller size)
FROM node:20-slim

# Set working directory
WORKDIR /app

# Install dependencies for building
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy package.json and package-lock.json (or yarn.lock)
COPY package*.json ./

# Install dependencies
# RUN npm install
RUN npm install --legacy-peer-deps
# Copy the rest of the application code
COPY . .

# Build the Next.js app
RUN npm run build

# Expose the port the app runs on
# EXPOSE 3000
EXPOSE 8080  
# Explicitly expose 8080

ENV PORT=8080 HOSTNAME="0.0.0.0"
# Start the app
CMD ["npm", "run", "start"]