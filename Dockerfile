FROM node:20.18.1-bullseye-slim
RUN apt-get update --fix-missing && apt-get -y upgrade && apt-get install -y git wget gnupg && apt-get clean

# Install latest chrome stable package.
RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add -
RUN sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list'
RUN apt-get update \
    && apt-get install -y google-chrome-stable --no-install-recommends \
    && apt-get clean
WORKDIR /usr/app
COPY ./package*.json .
RUN npm install --production --silent
RUN addgroup --system tester-group && adduser --system --ingroup tester-group tester
RUN touch .entry-point && chown tester:tester-group .entry-point
RUN mkdir .testplane && chown tester:tester-group .testplane
USER tester:tester-group
COPY ./dist .

EXPOSE 3000
CMD ["node", "app.js"]