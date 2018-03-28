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

  it('should not use layouts if body is not a string', function(done) {
    var jsonEngine = function(path, options, callback) {
      require('fs').readFile(path, function (err, content) {
        if (err) return callback(err)
        return callback(null, JSON.parse(content.toString()))
      })
    }
    app.engine('json', jsonEngine)

    app.set('layout', true)
    app.use(function(req, res){
      res.render(__dirname + '/fixtures/view.json', { body: { foo: 'bar' } })
    })

    request(app).get('/').expect({}, done)
  })
})
