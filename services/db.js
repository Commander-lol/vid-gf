const level = require('level')

module.exports = class Database {
	constructor(path = env('DB_PATH', './db')) {
		this._db = level(path)
	}

	put(key, value) {
		return new Promise((resolve, reject) => {
			this._db.put(key, value, err => {
				if (err) {
					reject(err)
				} else {
					resolve(true)
				}
			})
		})
	}

	get(key) {
		return new Promise((resolve, reject) => {
			this._db.get(key, (err, val) => {
				if (err) {
					reject(err)
				} else {
					resolve(val)
				}
			})
		})
	}

	putJSON(key, obj) {
		return this.put(key, JSON.stringify(obj))
	}

	getJSON(key) {
		return this.get(key).then(val => JSON.parse(val))
	}
}