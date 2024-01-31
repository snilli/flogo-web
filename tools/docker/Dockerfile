ARG GOLANG_VERSION=latest
FROM golang:$GOLANG_VERSION AS gobase

FROM node:16-alpine as base
ENV GOPATH /go
ENV PATH $GOPATH/bin:/usr/local/go/bin:$PATH

COPY --from=gobase /usr/local/go/ /usr/local/go/

RUN set -ex \
  && apk --update --no-cache add \
  gcc \
  openssl \
  git \
  ca-certificates \
  procps \
  g++ \
  bash \
  && mkdir -p "$GOPATH/src" "$GOPATH/bin" && chmod -R 775 "$GOPATH" \
  && rm -rf /var/cache/apk/*

FROM base AS builder
ARG CLI_VERSION latest
ARG CORE_VERSION latest
ENV FLOGO_LIB_VERSION ${CORE_VERSION}
ENV BUILD_DIR /tmp/build
ENV FLOGO_WEB_LOCALDIR ${BUILD_DIR}/dist/local
ENV GO111MODULE on
ENV CGO_ENABLED 1
RUN go env -w GOFLAGS="-buildvcs=false"
RUN go install github.com/project-flogo/cli/...@latest
RUN flogo --version
RUN go install github.com/project-flogo/services/flow-store/...@latest

#    && mkdir -p $GOPATH/src/github.com/project-flogo \
#    && cd $GOPATH/src/github.com/project-flogo \
#    && git clone https://github.com/project-flogo/cli.git \
COPY / ${BUILD_DIR}/
WORKDIR ${BUILD_DIR}
RUN yarn --pure-lockfile 
RUN yarn release
RUN cd dist/apps/server && \
  yarn --pure-lockfile --production=true && \
  npx modclean -Pr -n default:safe,default:caution

FROM base as release
ENV NODE_ENV production
ENV FLOGO_WEB_LOCALDIR /flogo-web/local
ENV FLOGO_WEB_PUBLICDIR /flogo-web/apps/client

COPY --from=builder /tmp/build/dist/ /flogo-web/
COPY --from=builder $GOPATH/ $GOPATH/

COPY ./tools/docker/flogo-eula /flogo-web/flogo-eula
COPY ./tools/docker/docker-start.sh /flogo-web/docker-start.sh

WORKDIR /flogo-web/
RUN cd local/engines/flogo-web && flogo build
ENTRYPOINT ["/flogo-web/docker-start.sh"]
