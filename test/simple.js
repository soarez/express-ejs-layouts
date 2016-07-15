var express = require('express')
  , expressLayouts = require('..')
  , request = require('supertest')
  , should = require('should')

var app, req

beforeEach(function() {
  app = express()
  app.use(expressLayouts)
  app.set('env', 'test')
  app.set('view engine', 'ejs')
  app.set('views', __dirname + '/fixtures')
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

  it('should pass variables on to layouts', function(done) {
    app.use(function(req, res) {
      res.render(__dirname + '/fixtures/view.ejs', {
        layout: 'layoutWithMultipleContent',
        foo: 'foo',
        bar: 'bar'
      })
    })

    request(app).get('/').expect('bar\\/foo\nhi', done)
  })

  it('should pass res.locals on to layouts', function(done) {
    app.use(function(req, res) {
      res.locals = {
        layout: 'layoutWithMultipleContent',
        foo: 'one',
        bar: 'two'
      }
      res.render(__dirname + '/fixtures/view.ejs')
    })

    request(app).get('/').expect('two\\/one\nhi', done)
  })
})
