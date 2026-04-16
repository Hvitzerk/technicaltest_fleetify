FROM golang:alpine AS builder


WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN CGO_ENABLED=0 GOOS=linux go build -o fleetify-api main.go

FROM alpine:latest

WORKDIR /root/

COPY --from=builder /app/fleetify-api .

EXPOSE 8000


CMD ["./fleetify-api"]