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
const upload = require('multer')()
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
	const tmpname = id + '.raw'
	const filename = id + '.gif'
	const tmppath = path.join(filepath, tmpname)
	const localpath = path.join(filepath, filename)

	fs.writeFile(tmppath, req.file.buffer, (err) => {
		if (err) {
			res.status(500).json(err)
		} else {
			res.contentType('gif')
			res.setHeader('X-File-Name', filename)
			ffmpeg(tmppath)
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
										fs.unlink(tmppath, (err) => {
											if (err) console.error(err)
										})
									})
								}
							})
						}
					})
				})
				.run()
		}
	})
})

app.listen(env('PORT', 4300))
