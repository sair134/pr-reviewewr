# 1️⃣ Base image: use Node for the Express app
FROM node:20-bullseye

# 2️⃣ Install dependencies for Ollama and linting tools
RUN apt-get update && apt-get install -y \
    curl \
    unzip \
    git \
    python3 \
    python3-pip \
    openjdk-11-jdk \
    golang-go \
    wget \
    && rm -rf /var/lib/apt/lists/*

# 3️⃣ Install Python linting tools
RUN pip3 install pylint

# 4️⃣ Install Checkstyle for Java
RUN wget https://github.com/checkstyle/checkstyle/releases/download/checkstyle-10.12.5/checkstyle-10.12.5-all.jar -O /usr/local/bin/checkstyle.jar \
    && echo '#!/bin/bash\njava -jar /usr/local/bin/checkstyle.jar "$@"' > /usr/local/bin/checkstyle \
    && chmod +x /usr/local/bin/checkstyle

# 5️⃣ Install golangci-lint
RUN curl -sSfL https://raw.githubusercontent.com/golangci/golangci-lint/master/install.sh | sh -s -- -b /usr/local/bin v1.55.2

# 6️⃣ Install Ollama
RUN curl -fsSL https://ollama.com/install.sh | sh

# 7️⃣ Note: CodeLlama model will be pulled at runtime
RUN ollama serve & sleep 5 && ollama pull codellama:7b
# (This avoids long build times and potential timeout issues)
 
# 8️⃣ Set up app directory
WORKDIR /app

# 9️⃣ Copy package files & install dependencies
COPY package*.json ./
RUN npm install --production

# 🔟 Copy rest of the app
COPY . .

# 1️⃣1️⃣ Expose Express port
EXPOSE 3000

# 1️⃣2️⃣ Start Ollama in background & then run Express
CMD ["sh", "-c", "ollama serve & sleep 5 && npx ts-node server.js"]
