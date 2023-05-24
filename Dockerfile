FROM node:18 AS ui-build
WORKDIR /usr/src/app
COPY soundstorm-react/ ./soundstorm-react/
RUN cd soundstorm-react && yarn && yarn build

FROM node:18 AS server-build
WORKDIR /root/
COPY --from=ui-build /usr/src/app/soundstorm-react/build ./soundstorm-react/build
COPY api/package*.json ./api/
RUN cd api && yarn
COPY api/server.js ./api/
RUN git rev-parse HEAD > ./api/.version
RUN git describe --tags --abbrev=0 --exact-match HEAD > ./api/.tag

EXPOSE 2222

CMD ["node", "./api/server.js"]
