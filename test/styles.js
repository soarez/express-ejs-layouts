var express = require('express')
  , expressLayouts = require('..')
  , request = require('supertest')
  , should = require('should')

var app, req

beforeEach(function() {
  app = express()
  app.use(expressLayouts)
  app.set('env', 'test');
  app.set('view engine', 'ejs')
  app.set('views', __dirname + '/fixtures')
})

describe('parsing styles', function() {
  it ('should not parse styles by default', function(done) {
    app.use(function(req, res){
      res.render(__dirname + '/fixtures/viewWithStyle.ejs', { layout: 'layoutWithStyle' })
    })

    request(app).get('/').expect('contentb4<link rel="stylesheet" href="/path/to/file.css"><link rel="stylesheet" href="/path/to/file2.css"></link><style>body{}</style>content after\n++\n', done)
  })

  it ('should parse styles if said in app.set("layout extractStyles", true)', function(done) {
    app.set("layout extractStyles", true)
    app.use(function(req, res){
      res.render(__dirname + '/fixtures/viewWithStyle.ejs', { layout: 'layoutWithStyle' })
    })

    request(app).get('/').expect('contentb4content after\n++<link rel="stylesheet" href="/path/to/file.css">\n<link rel="stylesheet" href="/path/to/file2.css"></link>\n<style>body{}</style>\n', done)
  })

  it ('should parse styles if said in locals regardless of app.set("layout parse script", ...)', function(done) {
    app.set("layout extractStyles", false)
    app.use(function(req, res){
      res.render(__dirname + '/fixtures/viewWithStyle.ejs', { layout: 'layoutWithStyle', extractStyles: true })
    })

    request(app).get('/').expect('contentb4content after\n++<link rel="stylesheet" href="/path/to/file.css">\n<link rel="stylesheet" href="/path/to/file2.css"></link>\n<style>body{}</style>\n', done)
  })

  it ("shouldn't complain even if there are no styles in the view", function(done) {
    app.set("layout extractStyles", true)
    app.use(function(req, res){
      res.render(__dirname + '/fixtures/view.ejs', { layout: 'layoutWithStyle', extractStyles: true })
    })

    request(app).get('/').expect('hi++\n', done)
  })
})
