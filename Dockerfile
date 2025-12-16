FROM node:18

RUN apt-get update \
 && apt-get install -y libreoffice \
 && apt-get clean

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .

RUN node node_modules/typescript/bin/tsc

RUN mkdir -p uploads

COPY ./fonts /usr/share/fonts/truetype/bookman/
RUN fc-cache -f -v

EXPOSE 8090
CMD ["npm", "start"]
