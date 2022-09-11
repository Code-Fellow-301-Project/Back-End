'use strict';

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { response } = require('express');
const mongoose = require('mongoose'); // 0 - import mongoose
const { parse } = require('dotenv');
const axios = require('axios');

const server = express();

server.use(cors()); //make my server open for any request
server.use(express.json());

//IP : http://localhost:PORT

const PORT = process.env.PORT;

// const mongoURL = process.env.MONGO
// // mongoose config
// mongoose.connect(`${mongoURL}`, { useNewUrlParser: true, useUnifiedTopology: true }); // 1 - connect mongoose with DB (301d35-books)

// const bookSchema = new mongoose.Schema({ //define the schema (structure)
//   title: String,
//   description: String,
//   status: String
// });

// const BookModel = mongoose.model('Book', bookSchema); //compile the schema into a model

//seed data (insert initial data)

// async function seedData() {


//   await firstBook.save();
//   await secondBook.save();
//   await thirdBook.save();
// }

// seedData();

//Routes
server.get('/', homeHandler);
server.get('/test', testHandler);
server.get('/news', getNews)
server.get('*', defualtHandler);


// http://localhost:3000/
function homeHandler(req, res) {
  res.send("Hi from the home route");
}

// http://localhost:3000/test
function testHandler(req, res) {
  res.status(200).send("You are requesting the test route");
}

// http://localhost:3000/*
function defualtHandler(req, res) {
  res.status(404).send("Sorry, Page not found");
}

// http://localhost:3000/news
async function getNews(req, res) {
  let allArticles = []
    for (const news of allNews) {
      let articles = await news.getNews()
      allArticles.push(...articles)
    }
    res.send(allArticles)
}

// listener
server.listen(PORT, () => {
  console.log(`Listening on ${PORT}`);
})

class NewsAPI {
  async getNews() {
    var result = await axios.get(`https://newsapi.org/v2/everything?q=default&apiKey=${process.env.NEWSAPI_KEY}`)
    return this.parseArticles(result)
  }
  async searchNews(query) {
    var result = await axios.get(`https://newsapi.org/v2/everything?q=${query}&apiKey=${process.env.NEWSAPI_KEY}`)
    return this.parseArticles(result);
  }

  parseArticles(res) {
    return res.data.articles.map((article) => {
      return new Article(article.title, article.description, article.content, article.image, article.publishedAt, article.source.name, article.url)
    });
  }
}

class GNews {
  async getNews() {
    var result = await axios.get(`https://gnews.io/api/v4/search?q=default&token=${process.env.GNEWS_API_KEY}`)
    return this.parseArticles(result)
  }
  async searchNews(query) {
    var result = await axios.get(`https://gnews.io/api/v4/search?q=${query}&token=${process.env.GNEWS_API_KEY}`)
    return this.parseArticles(result);
  }

  parseArticles(res) {
    return res.data.articles.map((article) => {
      return new Article(article.title, article.description, article.content, article.image, article.publishedAt, article.source.name, article.url)
    });
  }
}

const allNews = [new NewsAPI(), new GNews()]
// const allNews = [new GNews()]

class Article {
  constructor(headline, description, content, image, date, source, url) {
    this.headline = headline;
    this.description = description;
    this.content = content;
    this.image = image;
    this.date = date
    this.source = source;
    this.url = url;
  }
}