FROM node:16.15.1-alpine AS builder
#RUN apk add --no-cache --virtual python3 make g++ curl
WORKDIR /opt/node_app
COPY . .
RUN npm install && npm run build

FROM node:16.15.1-alpine AS app
ENV NODE_PORT=5000
COPY .docker/entrypoint.sh /tmp/
RUN ["chmod", "+x", "/tmp/entrypoint.sh"]
WORKDIR /opt/node_app
COPY --from=builder /opt/node_app/node_modules node_modules
ENV PATH=/opt/node_app/node_modules/.bin:$PATH
COPY --from=builder /opt/node_app/dist /opt/node_app
EXPOSE $NODE_PORT
ENTRYPOINT ["/tmp/entrypoint.sh"]