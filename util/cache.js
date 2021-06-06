const { promisify } = require("util");
const redis = require("redis");
const redisClient = redis.createClient({ host: "localhost", port: 6379 });

redisClient.on("ready", () => {
  console.log("Redis is ready");
});

redisClient.on("error", (err) => {
  console.log(err);
});

const get = promisify(redisClient.get).bind(redisClient);
const set = promisify(redisClient.set).bind(redisClient);
const del = promisify(redisClient.del).bind(redisClient);
const keys = promisify(redisClient.keys).bind(redisClient);

module.exports = {
  client: redisClient,
  get,
  set,
  del,
  keys
};
