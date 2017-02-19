# vid-gf Video Converter

Upload videos, download gifs. Mirrors all of the created gifs to an s3 bucket 
so you can link to them online without totally trashing your server's bandwidth.

Future updates will add some neat extras, but for now it's a straight up
vid-gif conversion, which is still pretty sweet.

## Requires

- Node v6 +
- ffmpeg (included in libav-tools on debian systems)
- ffprobe (included in libav-tools on debian systems)

### Recommended

- Yarn (For consistent dependency installation)
- pm2 (For process monitoring & management)

## Installation

*Using recommended tools*

```bash
sudo apt install libav-tools # install ffmpeg & ffprobe
git clone https://github.com/commander-lol/vid-gf.git
cd vid-gf
yarn
nano process.json # create a pm2 config
pm2 start process
```

*Simple installation*

```bash
sudo apt install libav-tools # install ffmpeg & ffprobe
git clone https://github.com/commander-lol/vid-gf.git
cd vid-gf
npm i
node app
```

## Usage

- In a browser, navigate to `http://<vid-gf domain>`

- Select a video file to upload

- Press upload

- ???

- Profit