# Use the latest LTS version of Node.js as a base image
FROM node:18-slim

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json files to the container
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy the Express app into the container
COPY . .

# Expose port 3000 for incoming requests
EXPOSE 12001

# Start the app when the container is started
CMD ["npm", "run", "start"]
