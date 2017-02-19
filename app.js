require('dotenv').config()

const s = require('streamifier')

global.env = function getEnvironmentVariable(name, def = null) {
	if (process.env[name] == null || process.env[name] === '') {
		if (def instanceof Error) {
			throw def
		} else {
			return def
		}
	}
	return process.env[name]
}

const db = new (require('./services/db'))()
const app = require('express')()
const upload = require('multer')({ dest: env('UPLOAD_DIR' || __dirname + '/files') })
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs')
const path = require('path')
const uuid = require('uuid')

const S3 = require('aws-sdk/clients/s3')

const filepath = env('TMP_PATH', path.join(__dirname, 'gifs'))

const bucket = new S3({
	params: {
		Bucket: env('S3_BUCKET', new Error('You must specify a bucket'))
	},
	region: 'eu-west-2',
	apiVersion: '2006-03-01'
})

app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, '/index.html'))
})

app.post('/convert', upload.single('file'), (req, res) => {
	const id = uuid.v4()
	const filename = id + '.gif'
	const localpath = path.join(filepath, filename)

	res.contentType('gif')
	res.setHeader('X-File-Name', filename)

	ffmpeg(s.createReadStream(req.file.buffer))
		.noAudio()
		.toFormat('gif')
		.output(res, { end: true })
		.output(localpath)
		.on('end', function() {
			fs.stat(localpath, (err, stat) => {
				if (err) {
					console.error(err)
					// Remote errors dawg
				} else {
					const bucketStream = fs.createReadStream(localpath)
					bucket.putObject({
						Key: filename,
						Body: bucketStream,
						ContentLength: stat.size
					}, (err, data) => {
						if (err) {
							console.error(err)
						} else {
							db.putJSON(filename, data)
							fs.unlink(localpath, (err) => {
								if (err) console.error(err)
							})
						}
					})
				}
			})
		})
		.run()
})

app.listen(4300)