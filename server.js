"use strict";

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { response, query } = require("express");
const mongoose = require("mongoose"); // 0 - import mongoose
const { parse } = require("dotenv");
const axios = require("axios");

const server = express();

server.use(cors()); //make my server open for any request
server.use(express.json());

//IP : http://localhost:PORT
const PORT = process.env.PORT || 3001;

const mongoURL = process.env.MONGO;
// mongoose config
mongoose.connect(`${mongoURL}`, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}); // 1 - connect mongoose with DB (atlas)

const postSchema = new mongoose.Schema({
  //define the schema (structure)
  title: String,
  description: String,
  name: String,
});

const PostModel = mongoose.model("Post", postSchema); //compile the schema into a model

//seed data (insert initial data)
async function seedData() {
  const firstPost = new PostModel({
    title: "Dummy Post 1",
    description:
      "Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus.",
    name: "Dummy user 1",
  });

  const secondPost = new PostModel({
    title: "Dummy Post 2",
    description:
      "Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus.",
    name: "Dummy user 2",
  });

  const thirdPost = new PostModel({
    title: "Dummy Post 3",
    description:
      "Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus.",
    name: "Dummy user 3",
  });

  const fourthPost = new PostModel({
    title: "Dummy Post 4",
    description:
      "Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus.",
    name: "Dummy user 4",
  });

  await firstPost.save();
  await secondPost.save();
  await thirdPost.save();
  await fourthPost.save();
}

// seedData();

//Routes
server.get("/", homeHandler);
server.get("/test", testHandler);
server.get("/news", getNews);
server.get("/searchNews", searchNews);
server.get("/getPosts", postHandler);
server.post("/addPost", addPostHandler);
server.delete("/deletePost/:id", deletePostsHandler);
server.put("/updatePost/:id", updatePostHandler);
server.get("*", defualtHandler);

// http://localhost:3001/
function homeHandler(req, res) {
  res.send("Hi from the home route");
}

// http://localhost:3001/test
function testHandler(req, res) {
  res.status(200).send("You are requesting the test route");
}

// http://localhost:3001/*
function defualtHandler(req, res) {
  res.status(404).send("Sorry, Page not found");
}

// http://localhost:3001/news
async function getNews(req, res) {
  let allArticles = [];
  for (const news of allNews) {
    let articles = await news.getNews();
    allArticles.push(...articles);
  }
  res.send(allArticles);
}

// http://localhost:3001/searchNews?query=query
async function searchNews(req, res) {
  let allArticles = [];
  for (const news of allNews) {
    let articles = await news.searchNews(req.query.query);
    allArticles.push(...articles);
  }
  res.send(allArticles);
}

class NewsAPI {
  async getNews() {
    try {
      var result = await axios.get(
        `https://newsapi.org/v2/everything?q=default&apiKey=${process.env.NEWSAPI_KEY}`
      );
      return this.parseArticles(result);
    } catch (e) {
      console.log(e);
      console.log("error in NewsAPI articles");
    }
  }
  async searchNews(query) {
    try {
      var result = await axios.get(
        `https://newsapi.org/v2/everything?q=${query}&apiKey=${process.env.NEWSAPI_KEY}`
      );
      return this.parseArticles(result);
    } catch (e) {
      console.log(e);
      console.log("error in NewsAPI search");
    }
  }
  parseArticles(res) {
    return res.data.articles.map((article) => {
      return new Article(
        article.title,
        article.description,
        article.content,
        article.urlToImage,
        article.publishedAt,
        article.source.name,
        article.url
      );
    });
  }
}

class GNews {
  async getNews() {
    try {
      var result = await axios.get(
        `https://gnews.io/api/v4/search?q=default&token=${process.env.GNEWS_API_KEY}`
      );
      return this.parseArticles(result);
    } catch (e) {
      console.log(e);
      console.log("error in getting GNews articles");
    }
  }
  async searchNews(query) {
    try {
      var result = await axios.get(
        `https://gnews.io/api/v4/search?q=${query}&token=${process.env.GNEWS_API_KEY}`
      );
      return this.parseArticles(result);
    } catch (e) {
      console.log(e);
      console.log("error in GNews search");
    }
  }
  parseArticles(res) {
    return res.data.articles.map((article) => {
      return new Article(
        article.title,
        article.description,
        article.content,
        article.image,
        article.publishedAt,
        article.source.name,
        article.url
      );
    });
  }
}

const allNews = [new NewsAPI()];
// const allNews = [new GNews()]

class Article {
  constructor(headline, description, content, image, date, source, url) {
    this.headline = headline;
    this.description = description;
    this.content = content;
    this.image = image;
    this.date = date;
    this.source = source;
    this.url = url;
  }
}

function postHandler(req, res) {
  console.log("get");
  // const name = req.query.name
  PostModel.find({}, (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(result);
      console.log(result);
    }
  });
}

async function addPostHandler(req, res) {
  const { title, description, name } = req.body;
  await PostModel.create({
    title: title,
    description: description,
    name: name,
  });
  PostModel.find({}, (err, result) => {
    if (err) {
      console.log(err);
    } else {
      console.log(result);
      res.send(result);
    }
  });
}

function deletePostsHandler(req, res) {
  const postID = req.params.id;
  PostModel.deleteOne({ _id: postID }, (err, result) => {
    PostModel.find({}, (err, result) => {
      if (err) {
        console.log(err);
      } else {
        console.log(result);
        res.send(result);
      }
    });
  });
}

function updatePostHandler(req, res) {
  const postID = req.params.id;
  const { title, description, name } = req.body; // destructuring assignment
  PostModel.findByIdAndUpdate(
    postID,
    { title, description, name },
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        PostModel.find({}, (err, result) => {
          if (err) {
            console.log(err);
          } else {
            res.send(result);
          }
        });
      }
    }
  );
}

// listener
server.listen(PORT, () => {
  console.log(`Listening on ${PORT}`);
});
