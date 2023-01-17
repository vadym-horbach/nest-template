FROM node:18.13.0-alpine AS builder
WORKDIR /opt/node_app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:18.13.0-alpine AS app
ENV NODE_PORT=5000
COPY .docker/entrypoint.sh /tmp/
RUN ["chmod", "+x", "/tmp/entrypoint.sh"]
WORKDIR /opt/node_app
COPY --from=builder /opt/node_app/node_modules node_modules
ENV PATH=/opt/node_app/node_modules/.bin:$PATH
COPY --from=builder /opt/node_app/dist /opt/node_app
EXPOSE $NODE_PORT
ENTRYPOINT ["/tmp/entrypoint.sh"]