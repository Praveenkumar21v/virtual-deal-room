# Use official Node.js image as the base
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the entire frontend project
COPY . .

# Build the Next.js application
RUN npm run build

# -----------------
# Production Image
# -----------------
FROM node:18-alpine

WORKDIR /app

# Copy only the built application from the builder stage
COPY --from=builder /app ./

# Expose the port Next.js will use
EXPOSE 3000

# Start the Next.js server
CMD ["npm", "run", "start"]
