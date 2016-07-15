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

describe('parsing metas', function() {
  it ('should not parse metas by default', function(done) {
    app.use(function(req, res){
      res.render(__dirname + '/fixtures/viewWithMeta.ejs', { layout: 'layoutWithMeta' })
    })

    request(app).get('/').expect('++contentb4<meta name="charset" content="utf-8"><meta name="keywords" content="xyzzy" />content after\n\n', done)
  })

  it ('should parse metas if said in app.set("layout extractMetas", true)', function(done) {
    app.set("layout extractMetas", true)
    app.use(function(req, res){
      res.render(__dirname + '/fixtures/viewWithMeta.ejs', { layout: 'layoutWithMeta' })
    })

    request(app).get('/').expect('<meta name="charset" content="utf-8">\n<meta name="keywords" content="xyzzy" />++contentb4content after\n\n', done)
  })

  it ('should parse metas if said in locals regardless of app.set("layout extractMetas", ...)', function(done) {
    app.set("layout extractMetas", false)
    app.use(function(req, res){
      res.render(__dirname + '/fixtures/viewWithMeta.ejs', { layout: 'layoutWithMeta', extractMetas: true })
    })

    request(app).get('/').expect('<meta name="charset" content="utf-8">\n<meta name="keywords" content="xyzzy" />++contentb4content after\n\n', done)
  })

  it ("shouldn't complain even if there are no metas in the view", function(done) {
    app.set("layout extractMetas", true)
    app.use(function(req, res){
      res.render(__dirname + '/fixtures/view.ejs', { layout: 'layoutWithMeta', extractMetas: true })
    })

    request(app).get('/').expect('++hi\n', done)
  })
})

