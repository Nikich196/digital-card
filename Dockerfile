# ---------- build ----------
FROM node:22-alpine AS builder
WORKDIR /app

# Ставится до npm ci, и это принципиально. Postinstall Prisma на этом шаге
# определяет платформу и тянет ровно один движок. Без openssl в Alpine
# определение проваливается, Prisma откатывается на сборку под OpenSSL 1.1,
# а такой библиотеки в образе нет — движок потом не грузится вообще.
RUN apk add --no-cache openssl

COPY package*.json ./
COPY prisma ./prisma
RUN npm ci

COPY tsconfig.json nest-cli.json ./
COPY src ./src
RUN npx prisma generate && npm run build

# ---------- runtime ----------
FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

RUN apk add --no-cache dumb-init openssl

COPY package*.json ./
COPY prisma ./prisma
# ts-node is kept on purpose: `prisma db seed` runs the TypeScript seed script.
RUN npm ci --omit=dev && npm install ts-node@10.9.2 typescript@5.7.2 && npx prisma generate

COPY --from=builder /app/dist ./dist
# The query console served at /.
COPY public ./public
COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh && chown -R node:node /app

USER node
EXPOSE 3000

# The container is only healthy once GraphQL answers and the database responds.
HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3   CMD node -e "fetch('http://127.0.0.1:3000/graphql',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({query:'{health{status}}'})}).then(r=>r.json()).then(d=>process.exit(d?.data?.health?.status==='ok'?0:1)).catch(()=>process.exit(1))"

ENTRYPOINT ["dumb-init", "--", "./docker-entrypoint.sh"]
CMD ["node", "dist/src/main.js"]
