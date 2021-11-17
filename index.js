require("dotenv").config();
const twit = require("./auth");
const fs = require("fs");
const path = require("path");
const paramsPath = path.join(__dirname, "record.json");

const writeRecords = data => {
  console.log("We are writing the params file ...", data);
  return fs.writeFileSync(paramsPath, JSON.stringify(data));
}

const readRecords = () => {
  console.log("We are reading the params file ...");
  const data = fs.readFileSync(paramsPath);
  return JSON.parse(data.toString());
}

const fetchTweets = last_record => {
  return new Promise((resolve, reject) => {
    let params = {
      q: "#dotnetcore",
      count: 10,
    };
    if (last_record) {
      params.since_id = last_record;
    }
    console.log("We are getting the tweets ...", params);
    twit.get("search/tweets", params, (err, data) => {
      if (err) {
        return reject(err);
      }
      return resolve(data);
    });
  });
}

const retweet = id => {
  return new Promise((resolve, reject) => {
    let params = {
      id,
    };
    twit.post("statuses/retweet/:id", params, (err, data) => {
      if (err) {
        return reject(err);
      }
      return resolve(data);
    });
  });
}

async function main() {
  try {
    const params = readRecords();
    const data = await fetchTweets(params.since_id);
    const tweets = data.statuses;
    console.log(`We got ${tweets.length} tweets so far 🤖`);
    for await (let tweet of tweets) {
      try {
        await retweet(tweet.id_str);
        console.log(`Retweeted 🤖 ${tweet.id_str}`);
      } catch (err) {
        console.log(`Couldn't retweet ☠️ ${tweet.id_str}`);
      }
      params.since_id = tweet.id_str;
    }
    writeRecords(params);
  } catch (err) {
    console.error(err);
  }
}

console.log("Getting back to work 🤖");

setInterval(main, 10000);