#
# Copyright (C) 2017 Artur B.
#

FROM node:8

RUN mkdir -p /usr/src/app

# Copy SRC and set WORKDIR
COPY . /usr/src/app
WORKDIR /usr/src/app
# Packages for sound
RUN apt-get update && apt-get -y install build-essential libasound2-dev apt-utils
# Packages for instagram
RUN apt-get -y install python-setuptools python-virtualenv
RUN easy_install pip
RUN git clone https://github.com/rarcega/instagram-scraper.git
# Select previous commit
RUN ["/bin/bash", "-c", "cd instagram-scraper && git reset --hard d53672a31d983bff58c07afd1daefa859423f5b9"]
# Make it executeable, move it, change directory and run setup script
RUN ["/bin/bash", "-c", "chmod +x config/instagram-scraper.sh && mv config/instagram-scraper.sh instagram-scraper/ && cd instagram-scraper/ && /usr/src/app/instagram-scraper/instagram-scraper.sh"]
# Create a symlink to the executable file
RUN ["/bin/bash", "-c", "ln -s /usr/src/app/instagram-scraper/venv/bin/instagram-scraper /usr/local/bin/instagram-scraper"]
# Install npm packages
RUN npm install -g node-gyp
RUN npm install

# http
EXPOSE 3000
CMD ["npm", "start"]
