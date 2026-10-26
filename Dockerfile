# Same Playwright version as package.json, so browsers and the test runner match
FROM mcr.microsoft.com/playwright:v1.55.1-noble

WORKDIR /tests
COPY package.json package-lock.json ./
RUN npm ci
COPY . .

CMD ["npx", "playwright", "test"]
