FROM node:18 AS ui-build
WORKDIR /usr/src/app
COPY soundstorm-react/ ./soundstorm-react/
RUN cd soundstorm-react && yarn && yarn build

FROM node:18 AS server-build
WORKDIR /root/
COPY --from=ui-build /usr/src/app/soundstorm-react/build ./soundstorm-react/build
COPY api/package*.json ./api/
COPY api/.version ./api/
COPY api/.tag ./api/
RUN cd api && yarn
COPY api/server.bundle.js ./api/
RUN mkdir api/uploads

EXPOSE 2222

CMD ["node", "./api/server.bundle.js"]
