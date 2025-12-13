FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy project files
COPY . .

# Expose port 3000
EXPOSE 3000

# Build the Next.js application
RUN npm run build

# Start the application in production mode
CMD ["npm", "run", "start"]
