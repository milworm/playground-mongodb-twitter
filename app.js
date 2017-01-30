require('dotenv').config()

const MongoClient = require('mongodb').MongoClient
const Twitter = require('twitter')
const express = require('express')
const consolidate = require('consolidate')
const {
	TWITTER_CONSUMER_KEY,
	TWITTER_CONSUMER_SECRET,
	TWITTER_ACCESS_TOKEN_KEY,
	TWITTER_ACCESS_TOKEN_SECRET
} = process.env

let client = new Twitter({
	consumer_key: TWITTER_CONSUMER_KEY,
  consumer_secret: TWITTER_CONSUMER_SECRET,
  access_token_key: TWITTER_ACCESS_TOKEN_KEY,
  access_token_secret: TWITTER_ACCESS_TOKEN_SECRET
})

let app = express()
let db

app.engine('html', consolidate.swig)
app.set('view engine', 'html')
app.set('views', __dirname + '/views')

app.get('/', async (req, res) => {
	let tweets = await db.collection('tweets').find({}).toArray()

	res.render('index', {
		tweets
	})
})

app.get('/refresh', async (req, res) => {
	let response = await client.get('search/tweets', {
		q: '60devs',
		count: 100
	})
	let tweets = response.statuses.map(tweet => {
		return {
			tweet_id: tweet.id_str,
			text: tweet.text,
			user: {
				screen_name: tweet.user.screen_name
			}
		}
	})
	try {
		await db.collection('tweets').insertMany(tweets, {
			ordered: false
		})
	} catch(e) {
		console.warn(e.message)
	}

	res.redirect('/')
})

let server = app.listen(3000, async () => {
	db = await MongoClient.connect('mongodb://localhost:27017/60devs')
	console.log(`server is running on port ${server.address().port}`)
})