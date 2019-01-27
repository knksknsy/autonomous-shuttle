#
# Copyright (C) 2017 Artur B.
#

FROM node:8

RUN mkdir -p /usr/src/app

# Copy & install app dependencies
COPY . /usr/src/app
WORKDIR /usr/src/app
RUN npm install && npm rebuild node-sass --force

EXPOSE 4200
CMD ["npm", "start"]
