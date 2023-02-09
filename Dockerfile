FROM node:16-alpine


# RUN mkdir myfolder myfolder가 없으면 COPY할 떄, 어차피 자동으로 만들어짐
WORKDIR /busker/
COPY ./package.json /busker/
# COPY ./yarn.lock /myfolder/
RUN yarn install --develop



COPY . /busker/
RUN yarn build
CMD yarn start:dev
