# Docker Image for BuildKite CI
# -----------------------------
FROM node:8.12.0

WORKDIR /streetscape

RUN yarn global add yarn@1.10.0

WORKDIR /streetscape
ENV PATH /streetscape/node_modules/.bin:$PATH

ENV DISPLAY :99

RUN apt-get update
RUN apt-get -y install libxi-dev libgl1-mesa-dev xvfb

ADD .buildkite/xvfb /etc/init.d/xvfb
RUN chmod a+x /etc/init.d/xvfb

COPY . /streetscape/

RUN mv /streetscape/xviz /xviz && \
  cd /xviz && \
  yarn bootstrap

RUN cd /streetscape/ && yarn bootstrap
