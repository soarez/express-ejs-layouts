var express = require('express')
  , expressLayouts = require('..')
  , request = require('supertest')
  , should = require('should')

var app, req

beforeEach(function() {
  app = express()
  app.use(expressLayouts)
  app.set('view engine', 'ejs')
  app.set('views', __dirname + '/fixtures')
})

describe('not using layout', function() {
  it('should not use layouts if layout is set to false in the view options', function(done) {
    app.set('layout', true)
    app.use(function(req, res){
      res.render(__dirname + '/fixtures/view.ejs', { layout: false })
    })

    request(app).get('/').expect('hi', done)
  })

  it('should not use layouts if app.set("layout", false) and nothing was said in the view options', function(done) {
    app.set('layout', false)
    app.use(function(req, res){
      res.render(__dirname + '/fixtures/view.ejs')
    })

    request(app).get('/').expect('hi', done)
  })
})

describe('simple layout', function() {
  it('should look for template named "layout" by default', function(done) {
    app.use(function(req, res){
      res.render(__dirname + '/fixtures/view.ejs')
    })

    request(app).get('/').expect('<p>hi</p>', done)
  })

  it('should use the layout specified in app.set("layout", "layoutName")', function(done) {
    app.set('layout', 'otherLayout')
    app.use(function(req, res){
      res.render(__dirname + '/fixtures/view.ejs')
    })

    request(app).get('/').expect('<div>hi</div>', done)
  })

  it('should use the layout specified in the view options regarless of app.set("layout", ...)', function(done) {
    app.set('layout', false)
    app.use(function(req, res){
      res.render(__dirname + '/fixtures/view.ejs', { layout: 'otherLayout' })
    })

    request(app).get('/').expect('<div>hi</div>', done)
  })
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

  it('should parse multiple content sections', function(done) {
    app.use(function(req, res){
      res.render(__dirname + '/fixtures/viewWithContentForBody.ejs', { layout: 'layoutWithMultipleContent' })
    })

    request(app).get('/').expect('fight\\/club\nsomebody', done)
  });

  it('should parse multiple content sections and a body', function(done) {
    app.use(function(req, res){
      res.render(__dirname + '/fixtures/viewWithContentFor.ejs', { layout: 'layoutWithMultipleContent' })
    })

    request(app).get('/').expect('fight\\/club\nsomebody', done)
  });
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

describe('rendering contentFor', function() {
  it ('should provide a local function to specify content to be available in a local in the layout', function(done) {
    app.use(function(req, res){
      res.render(__dirname + '/fixtures/viewWithContentFor.ejs', { layout: 'layoutWithMultipleContent' })
    })

    request(app).get('/').expect('fight\\/club\nsomebody', done)
  })

  it ('should generate content speciffically for the body aswell', function(done) {
    app.use(function(req, res){
      res.render(__dirname + '/fixtures/viewWithContentForBody.ejs', { layout: 'layoutWithMultipleContent' })
    })

    request(app).get('/').expect('fight\\/club\nsomebody', done)
  })

  it ('should provide the locals to the layout aswell', function(done) {
    app.use(function(req, res){
      res.render(__dirname + '/fixtures/view.ejs',
        { layout: 'layoutWithMultipleContent', foo: 'oof', bar: 'rab' })
    })

    request(app).get('/').expect('rab\\/oof\nhi', done)
  })


  it ('should respond with 500 error when trying to render a view that doesn\'t exist', function(done) {
    app.use(function(req, res){
      res.render(__dirname + '/fixtures/imaginary.ejs',
        { layout: false })
    })

    request(app)
      .get('/')
      .expect(500)
      .end(function(error, res) {
        should.not.exist(error);

        res.serverError.should.be.true;

        done();
      })
  })
})

describe('defining sections with defineContent', function() {
  it ('should provide a function in the layout to define optional sections', function(done) {
    app.use(function(req, res){
      res.render(__dirname + '/fixtures/viewWithPartialContent.ejs', { layout: 'layoutWithDefineContent' })
    })

    request(app).get('/').expect(/tyler durden\nis\n\nreal\n*/, done)
  })
})

