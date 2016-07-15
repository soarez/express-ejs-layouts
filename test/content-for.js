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

describe('rendering contentFor', function() {
  it('should provide a local function to specify content to be available in a local in the layout', function(done) {
    app.use(function(req, res){
      res.render(__dirname + '/fixtures/viewWithContentFor.ejs', { layout: 'layoutWithMultipleContent' })
    })

    request(app).get('/').expect('fight\\/club\nsomebody', done)
  })

  it('should generate content speciffically for the body as well', function(done) {
    app.use(function(req, res){
      res.render(__dirname + '/fixtures/viewWithContentForBody.ejs', { layout: 'layoutWithMultipleContent' })
    })

    request(app).get('/').expect('fight\\/club\nsomebody', done)
  })

  it('should provide the locals to the layout as well', function(done) {
    app.use(function(req, res){
      res.render(__dirname + '/fixtures/view.ejs',
        { layout: 'layoutWithMultipleContent', foo: 'oof', bar: 'rab' })
    })

    request(app).get('/').expect('rab\\/oof\nhi', done)
  })

  it('should respond with 500 error when trying to render a view that doesn\'t exist', function(done) {
    app.use(function(req, res){
      res.render(__dirname + '/fixtures/imaginary.ejs',
        { layout: false })
    })

    request(app)
      .get('/')
      .expect(500)
      .end(function(error, res) {
        should.not.exist(error)

        res.serverError.should.be.true

        done()
      })
  })
})

describe('defining sections with defineContent', function() {
  it('should provide a function in the layout to define optional sections', function(done) {
    app.use(function(req, res){
      res.render(__dirname + '/fixtures/viewWithPartialContent.ejs', { layout: 'layoutWithDefineContent' })
    })

    request(app).get('/').expect(/tyler durden\nis\n\nreal\n*/, done)
  })
})
