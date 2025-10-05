# ---------- Stage 1: build Node app ----------
    FROM node:20-bookworm AS builder
    WORKDIR /app
    COPY package*.json ./
    RUN npm ci
    COPY tsconfig*.json ./
    COPY src ./src
    RUN npm run build && npm ci --omit=dev
    
    # ---------- Stage 2: fetch & prepare Python anonymizer ----------
    FROM node:20-bookworm AS pyfetch
    WORKDIR /opt
    RUN apt-get update && apt-get install -y git python3 python3-pip && rm -rf /var/lib/apt/lists/*
    RUN git clone --depth=1 https://github.com/Yma-Health/yma-anonymizer.git anonymizer
    WORKDIR /opt/anonymizer
    RUN pip3 install --no-cache-dir -r requirements.txt
    RUN chmod +x ./start_linux.sh
    
    # ---------- Stage 3: runtime ----------
    FROM node:20-bookworm
    WORKDIR /app
    
    # каталоги Super Protocol внутри TEE
    RUN mkdir -p /sp/inputs /sp/output /sp/run
    
    # Node runtime
    COPY --from=builder /app/dist ./dist
    COPY --from=builder /app/node_modules ./node_modules
    COPY --from=builder /app/package.json ./package.json
    
    # Python engine
    COPY --from=pyfetch /opt/anonymizer /app/anonymizer
    
    # по умолчанию путь к конфигу в TEE
    ENV CONFIGURATION_PATH=/sp/configurations/configuration.json
    
    ENTRYPOINT ["node", "./dist/index.js"]
    