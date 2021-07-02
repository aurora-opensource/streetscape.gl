# Docker Image for BuildKite CI
# -----------------------------
FROM node:11.12.0

# exposing a port to openly transfer data
EXPOSE 8080

# changed the current work directory to xviz 
WORKDIR /streetscape.gl

COPY . /streetscape.gl

# update apt get
RUN apt-get update

CMD npm --prefix examples/get-started run start-live
