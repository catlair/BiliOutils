FROM catlair/bilitools:latest
WORKDIR /usr/src/app
ENV SERVERLESS_PLATFORM_VENDOR=tencent
COPY ./serverless.yaml .
RUN npm install serverless -g \
    npm cache clean --force
ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["deploy"]
