# Docker Image for BuildKite CI
# -----------------------------
FROM node:14

# exposing a port to openly transfer data
EXPOSE 8080

# changed the current work directory to xviz 
WORKDIR /streetscape.gl

# update apt get
RUN apt-get update

# installing curl
RUN apt-get install curl git gcc libgl1-mesa-glx libglib2.0-0 libsm6 libxext6 libxrender-dev -y

COPY . /streetscape.gl

RUN curl -sL https://deb.nodesource.com/setup_13.x | bash

RUN apt-get install nodejs -y

ENV PUPPETEER_SKIP_DOWNLOAD=1

RUN npm install

RUN yarn bootstrap

RUN cd examples/get-started

RUN yarn 

RUN yarn start

