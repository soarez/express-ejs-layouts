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

describe('parsing scripts', function() {
  it ('should not parse scripts by default', function(done) {
    app.use(function(req, res){
      res.render(__dirname + '/fixtures/viewWithScript.ejs', { layout: 'layoutWithScript' })
    })

    request(app).get('/').expect('contentb4<script href="http://mischief.fc/mayhem.js">soap()</script>contentafter++', done)
  })

  it ('should parse scripts if said in app.set("layout extractScripts", true)', function(done) {
    app.set("layout extractScripts", true)
    app.use(function(req, res){
      res.render(__dirname + '/fixtures/viewWithScript.ejs', { layout: 'layoutWithScript' })
    })

    request(app).get('/').expect('contentb4contentafter++<script href="http://mischief.fc/mayhem.js">soap()</script>', done)
  })

  it ('should parse scripts if said in locals regardless of app.set("layout parse script", ...)', function(done) {
    app.set("layout extractScripts", false)
    app.use(function(req, res){
      res.render(__dirname + '/fixtures/viewWithScript.ejs', { layout: 'layoutWithScript', extractScripts: true })
    })

    request(app).get('/').expect('contentb4contentafter++<script href="http://mischief.fc/mayhem.js">soap()</script>', done)
  })

  it ("shouldn't complain even if there are no scripts in the view", function(done) {
    app.set("layout extractScripts", true)
    app.use(function(req, res){
      res.render(__dirname + '/fixtures/view.ejs', { layout: 'layoutWithScript', extractScripts: true })
    })

    request(app).get('/').expect('hi++', done)
  })

  it ('should extract mixed type scripts', function(done) {
    app.set('layout extractScripts', true)
    app.use(function(req, res){
      res.render(__dirname + '/fixtures/viewWithMixedScripts.ejs', { layout: 'layoutWithScript' })
    })

    request(app).get('/').expect('<div>foo</div>\n\n\n\n<div>bar</div>\n++<script src="i-need-a-file.js"></script>\n<script>\n    // I\'m a script block\n</script>\n<script type="application/javascript" src="i-need-another-file.js"></script>', done)
  })

  it('should parse multiple content sections', function(done) {
    app.use(function(req, res){
      res.render(__dirname + '/fixtures/viewWithContentForBody.ejs', { layout: 'layoutWithMultipleContent' })
    })

    request(app).get('/').expect('fight\\/club\nsomebody', done)
  })

  it('should parse multiple content sections and a body', function(done) {
    app.use(function(req, res){
      res.render(__dirname + '/fixtures/viewWithContentFor.ejs', { layout: 'layoutWithMultipleContent' })
    })

    request(app).get('/').expect('fight\\/club\nsomebody', done)
  })
})
