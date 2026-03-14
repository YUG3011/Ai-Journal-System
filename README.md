# ai assisted journal system

this project is a simple full stack journaling app. users write journal entries after nature sessions like forest, ocean or mountain.

the system analyse the emotion of the journal text using a llm and then show insights about the users mental state over time.

the goal of this project is to demonstrate api design, llm integration and basic frontend integration.

---

## tech stack

backend  
node.js  
express  
prisma orm  
postgresql  

frontend  
react with vite  

infra  
docker compose  
redis cache  

llm  
google gemini api

---

## main features

- users can create journal entries
- backend analyse emotions using llm
- previous entries can be viewed
- system generate simple insights about mood
- redis cache avoid repeated llm calls
- docker setup for easy local development

---

## project structure

backend  
handles api routes, database access and llm integration.

frontend  
simple react single page where users interact with the system.

database  
postgresql database stores journal entries and analysis results.

redis  
used to cache repeated analysis results.

---

## running the project locally

first install node.js and postgresql.

create a database named `aijournal`.

then start backend

```bash
cd backend
npm install
npx prisma migrate dev
npm run dev