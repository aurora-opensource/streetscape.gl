# Docker Image for BuildKite CI
# -----------------------------
FROM node:10

# exposing a port to openly transfer data
EXPOSE 8080

# changed the current work directory to xviz 
WORKDIR /streetscape.gl

COPY . /streetscape.gl

# update apt get
RUN apt-get update

RUN npm --prefix examples/get-started install

CMD npm --prefix examples/get-started run start-live
