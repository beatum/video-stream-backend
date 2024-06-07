## Description

A simple video stream service for "STSP" to "HLS".

## Configuration
### .env file:

```
### port
PORT=8000
### Ffmpeg path
FFMPEG_PATH=E:/ffmpeg/ffmpeg.exe
```

### streamconfig.json

```json
{
  "streams": [
    {
      "taskId": "01",
      "taskName": "01",
      "inputUrl": "rtsp://[user]:[password]@[your ip address]:[port]/h264/ch1/main/av_stream",
      "options": [
        "-c:v copy",
        "-c:a copy",
        "-max_delay 0.1",
        "-hls_time 1",
        "-hls_list_size 2"
      ]
    }
  ]
}
```

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## License
[Apache 2.0](LICENSE)