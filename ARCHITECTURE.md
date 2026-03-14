# architecture

## overview

this project is a simple ai assisted journal system. users write journal entries after nature sessions like forest, ocean or mountain. the backend store entries in a database and use a llm to analyse the emotion of the text.

the backend is built with node.js and express. prisma orm is used to talk with the postgresql database.

when user send a journal text, the backend call google gemini api to analyse emotion, keywords and summary. the result is stored in database so we can generate insights later.

the frontend is a small react single page app where user can write journal, see previous entries and view insights.

docker compose is used to run backend, redis and postgres easily in local system.

---

## how to scale this system to 100k users

to support many users we can scale the backend horizontally.

we can run multiple backend containers behind a load balancer like nginx or aws alb. this will distribute traffic between many backend servers.

database performance can be improved by adding indexes on important fields like userid and createdat. we can also use connection pooling or read replicas if traffic increase a lot.

for heavy operations like llm analysis we can move the work to background workers using a queue system. this will keep api fast and responsive.

static frontend files can also be served using a cdn so users load the app faster.

---

## how to reduce llm cost

llm api calls are expensive so we should try to reduce unnecessary calls.

first method is caching. if same journal text is analysed before, we return cached result instead of calling llm again.

we can also use smaller and cheaper models when possible.

another option is rate limiting and user quotas so users cannot send unlimited requests.

this helps control cost and also prevent abuse.

---

## how repeated analysis is cached

the system generate a sha256 hash of the journal text. this hash becomes the cache key.

when user send text for analysis, backend first check if this key exists in redis cache.

if cache exists, the result is returned immediately.

if cache does not exist, backend call the llm api and then store the result in redis with a ttl of 24 hours.

this way repeated texts dont call the llm again and response also becomes faster.

---

## how sensitive journal data is protected

journal entries can contain personal feelings so data protection is important.

in production the system should run behind https so all traffic is encrypted.

api keys and database credentials are stored in environment variables instead of source code.

database access should be limited using strong passwords and restricted network access.

logs should avoid printing journal text to prevent leaking private data.

 user authentication is implemented; encrypt journal text at rest is a future improvement.