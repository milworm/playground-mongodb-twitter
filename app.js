require('dotenv').config()

const MongoClient = require('mongodb').MongoClient
const Twitter = require('twitter')
const assert = require('assert')
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

class Application {
	async start() {
		try {
			let db = await MongoClient.connect('mongodb://localhost:27017/60devs')
			let query = {
				q: '60devs',
				count: 10
			}

			// get tweets
			let response = await client.get('search/tweets', query)
			let tweets = response.statuses.map(tweet => {
				return {
					tweet_id: tweet.id_str,
					text: tweet.text,
					user: {
						screen_name: tweet.user.screen_name
					}
				}
			})

			let result = await db.collection('tweets').insertMany(tweets)

			console.log(result)
			process.exit()
		} catch(e) {
			console.log(e)
		}
	}
}

let app = new Application()

app.start()