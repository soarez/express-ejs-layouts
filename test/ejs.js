var express = require('express')
  , expressLayouts = require('..')
  , request = require('./support/http')
  , should = require('should')

var app, req

beforeEach(function() {
  app = express()
  app.use(expressLayouts)
  app.set('view engine', 'ejs')
  app.set('views', __dirname + '/fixtures')

  req = function(fn) { request(app).get('/').end(function(res) { fn(res.body) }) }
})

describe('not using layout', function() {
  it('should not use layouts if layout is set to false in the view options', function(done) {
    app.set('layout', true)
    app.use(function(req, res){
      res.render(__dirname + '/fixtures/view.ejs', { layout: false })
    })
    req(function(body){
      body.should.equal('hi')
      done()
    })
  })

  it('should not use layouts if app.set("layout", false) and nothing was said in the view options', function(done) {
    app.set('layout', false)
    app.use(function(req, res){
      res.render(__dirname + '/fixtures/view.ejs')
    })
    req(function(body){
      body.should.equal('hi')
      done()
    })
  })
})

describe('simple layout', function() { 
  it('should look for template named "layout" by default', function(done) {
    app.use(function(req, res){
      res.render(__dirname + '/fixtures/view.ejs')
    })
    req(function(body){
      body.should.equal('<p>hi</p>')
      done()
    })
  })

  it('should use the layout specified in app.set("layout", "layoutName")', function(done) {
    app.set('layout', 'otherLayout')
    app.use(function(req, res){
      res.render(__dirname + '/fixtures/view.ejs')
    })
    req(function(body){
      body.should.equal('<div>hi</div>')
      done()
    })
  })

  it('should use the layout specified in the view options regarless of app.set("layout", ...)', function(done) {
    app.set('layout', false)
    app.use(function(req, res){
      res.render(__dirname + '/fixtures/view.ejs', { layout: 'otherLayout' })
    })
    req(function(body){
      body.should.equal('<div>hi</div>')
      done()
    })
  })
})

describe('parsing scripts', function() { 
  it ('should not parse scripts by default', function(done) {
    app.use(function(req, res){
      res.render(__dirname + '/fixtures/viewWithScript.ejs', 'layoutWithScript')
    })
    req(function(body){
      body.should.equal('<p>contentb4<script href="http://mischief.fc/mayhem.js">soap()</script>contentafter</p>')
      done()
    })
  })

  it ('should parse scripts if said in app.set("layout extractScripts", true)', function(done) {
    app.set("layout extractScripts", true)
    app.use(function(req, res){
      res.render(__dirname + '/fixtures/viewWithScript.ejs', { layout: 'layoutWithScript' })
    })
    req(function(body){
      body.should.equal('contentb4contentafter++<script href="http://mischief.fc/mayhem.js">soap()</script>')
      done()
    })
  })

  it ('should parse scripts if said in locals regardless of app.set("layout parse script", ...)', function(done) {
    app.set("layout extractScripts", false)
    app.use(function(req, res){
      res.render(__dirname + '/fixtures/viewWithScript.ejs', { layout: 'layoutWithScript', extractScripts: true })
    })
    req(function(body){
      body.should.equal('contentb4contentafter++<script href="http://mischief.fc/mayhem.js">soap()</script>')
      done()
    })
  })
  
  it ("shouldn't complain even if there are no scripts in the view", function(done) {
    app.set("layout extractScripts", true)
    app.use(function(req, res){
      res.render(__dirname + '/fixtures/view.ejs', { layout: 'layoutWithScript', extractScripts: true })
    })
    req(function(body){
      body.should.equal('hi++')
      done()
    })
  })
})

describe('rendering contentFor', function() { 
  it ('should provide a local function to specify content to be available in a local in the layout', function(done) {
    app.use(function(req, res){
      res.render(__dirname + '/fixtures/viewWithContentFor.ejs', { layout: 'layoutWithMultipleContent' })
    })
    req(function(body){
      body.should.equal('fight\\/club\nsomebody')
      done()
    })
  })
  
  it ('should generate content speciffically for the body aswell', function(done) {
    app.use(function(req, res){
      res.render(__dirname + '/fixtures/viewWithContentForBody.ejs', { layout: 'layoutWithMultipleContent' })
    })
    req(function(body){
      body.should.equal('fight\\/club\nsomebody')
      done()
    })
  })
})

