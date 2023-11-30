const assert = require('chai').assert
const newman = require('newman')
const fs = require('fs')
const PostmanMockBuilder = require('@jordanwalsh23/postman-mock-builder')

describe('Postman Contract Test Suite - GET AnyOf Requests', () => {
  let GET_SCHEMA = './test/v2/schemas/sample-product-GET-schema-anyOf-v2.json'

  describe('TEST001 - GET Full Product Response', () => {
    let test001MockServer = null
    before('setup mock server', done => {
      const PORT = 3555
      let schema = JSON.parse(fs.readFileSync(GET_SCHEMA, 'utf-8').toString())
      schema.host = "localhost:" + PORT

      test001MockServer = PostmanMockBuilder.create({
        apiVersion: 'TEST001'
      })

      test001MockServer
        .addState('API Schema')
        .addRequest({
          method: 'GET',
          path: '/schema'
        })
        .addResponse({
          status: 200,
          headers: {
            'Content-Type': 'application/json'
          },
          body: schema
        })

      let test001response = [
        {
          id: '1234',
          name: 'Name',
          description: 'Description',
          model: 'Model',
          sku: 'SKU',
          cost: 445,
          imageUrl: 'image-url'
        }
      ]

      let state = test001MockServer.addState('Return the full product schema')

      state
        .addRequest({
          method: 'GET',
          path: '/api/products'
        })
        .addResponse({
          status: 200,
          body: test001response
        })

      test001MockServer.start(PORT)
      done()
    })

    it('runs a contract test', done => {
      newman
        .run({
          collection: require('../../src/v2/Contract Test Generator.postman_collection.json'),
          environment: require('../../src/v2/Contract Test Environment.postman_environment.json'),
          envVar: [
            {
              key: 'env-schemaUrl',
              value: 'http://localhost:3555/schema'
            },
            {
              key: 'env-server',
              value: 'http://localhost:3555'
            }
          ]
        })
        .on('start', function (err, args) {
          // on start of run, log to console
          console.log('running a collection...')
        })
        .on('done', function (err, summary) {
          if (err || summary.error) {
            console.error('collection run encountered an error.')
            done(err)
          } else {
            console.log('collection run completed.')
            if (
              summary.run &&
              summary.run.failures &&
              summary.run.failures.length > 0
            ) {
              summary.run.failures.forEach(failure => {
                console.log(
                  'Test: ' +
                    failure.error.test +
                    ' - result: ' +
                    failure.error.message
                )
              })

              done('Tests Failed')
            } else {
              done()
            }
          }
        })
    })

    after('finish', done => {
      console.log('stopping server')
      test001MockServer.stop()
      done()
    })
  })

  describe('TEST002 - GET Partial Product Response', () => {
    let test001MockServer = null
    before('setup mock server', done => {
      const PORT = 3556
      let schema = JSON.parse(fs.readFileSync(GET_SCHEMA, 'utf-8').toString())
      schema.host = "localhost:" + PORT

      test001MockServer = PostmanMockBuilder.create({
        apiVersion: 'TEST002'
      })

      test001MockServer
        .addState('API Schema')
        .addRequest({
          method: 'GET',
          path: '/schema'
        })
        .addResponse({
          status: 200,
          headers: {
            'Content-Type': 'application/json'
          },
          body: schema
        })

      let test001response = [
        {
          test:"test"
        }
      ]

      let state = test001MockServer.addState('Return a partial product schema')

      state
        .addRequest({
          method: 'GET',
          path: '/api/products'
        })
        .addResponse({
          status: 200,
          headers: {
            'Content-Type': 'application/json'
          },
          body: test001response
        })

      test001MockServer.start(PORT)
      test001MockServer.exportCollection("exports/test-collection.json")
      done()
    })

    it('runs a contract test', done => {
      newman
        .run({
          collection: require('../../src/v2/Contract Test Generator.postman_collection.json'),
          environment: require('../../src/v2/Contract Test Environment.postman_environment.json'),
          envVar: [
            {
              key: 'env-schemaUrl',
              value: 'http://localhost:3556/schema'
            },
            {
              key: 'env-server',
              value: 'http://localhost:3556'
            }
          ]
        })
        .on('start', function (err, args) {
          // on start of run, log to console
          console.log('running a collection...')
        })
        .on('done', function (err, summary) {
          if (err || summary.error) {
            console.error('collection run encountered an error.')
            done(err)
          } else {
            console.log('collection run completed.')
            if (
              summary.run &&
              summary.run.failures &&
              summary.run.failures.length > 0
            ) {
              summary.run.failures.forEach(failure => {
                console.log(
                  'Test: ' +
                    failure.error.test +
                    ' - result: ' +
                    failure.error.message
                )
              })

              done('Tests Failed')
            } else {
              done()
            }
          }
        })
    })

    after('finish', done => {
      console.log('stopping server')
      test001MockServer.stop()
      done()
    })
  })

  describe('TEST003 - GET Neither Product Response', () => {
    let test001MockServer = null
    before('setup mock server', done => {
      const PORT = 3557
      let schema = JSON.parse(fs.readFileSync(GET_SCHEMA, 'utf-8').toString())
      schema.host = "localhost:" + PORT

      test001MockServer = PostmanMockBuilder.create({
        apiVersion: 'TEST003'
      })

      test001MockServer
        .addState('API Schema')
        .addRequest({
          method: 'GET',
          path: '/schema'
        })
        .addResponse({
          status: 200,
          headers: {
            'Content-Type': 'application/json'
          },
          body: schema
        })

      let test001response = [
        {
          foo:"bar"
        }
      ]

      let state = test001MockServer.addState('Return a partial product schema')

      state
        .addRequest({
          method: 'GET',
          path: '/api/products'
        })
        .addResponse({
          status: 200,
          body: test001response
        })

      test001MockServer.start(PORT)
      done()
    })

    it('runs a contract test', done => {
      newman
        .run({
          collection: require('../../src/v2/Contract Test Generator.postman_collection.json'),
          environment: require('../../src/v2/Contract Test Environment.postman_environment.json'),
          envVar: [
            {
              key: 'env-schemaUrl',
              value: 'http://localhost:3557/schema'
            },
            {
              key: 'env-server',
              value: 'http://localhost:3557'
            }
          ]
        })
        .on('start', function (err, args) {
          // on start of run, log to console
          console.log('running a collection...')
        })
        .on('done', function (err, summary) {
          if (err || summary.error) {
            console.error('collection run encountered an error.')
            done(err)
          } else {
            console.log('collection run completed.')
            if (
              summary.run &&
              summary.run.failures &&
              summary.run.failures.length > 0
            ) {
              summary.run.failures.forEach(failure => {
                console.log(
                  'Test: ' +
                    failure.error.test +
                    ' - result: ' +
                    failure.error.message
                )
              })

              done()
            } else {
              done('Expected this test to fail.')
            }
          }
        })
    })

    after('finish', done => {
      console.log('stopping server')
      test001MockServer.stop()
      done()
    })
  })

  describe('TEST004 - GET Both Product Response', () => {
    let test001MockServer = null
    before('setup mock server', done => {
      const PORT = 3558
      let schema = JSON.parse(fs.readFileSync(GET_SCHEMA, 'utf-8').toString())
      schema.host = "localhost:" + PORT

      test001MockServer = PostmanMockBuilder.create({
        apiVersion: 'TEST004'
      })

      test001MockServer
        .addState('API Schema')
        .addRequest({
          method: 'GET',
          path: '/schema'
        })
        .addResponse({
          status: 200,
          headers: {
            'Content-Type': 'application/json'
          },
          body: schema
        })

      let test001response = [
        {
          test: 'test',
          id: '1234',
          name: 'Name',
          description: 'Description',
          model: 'Model',
          sku: 'SKU',
          cost: 445,
          imageUrl: 'image-url'
        }
      ]

      let state = test001MockServer.addState('Return a partial product schema')

      state
        .addRequest({
          method: 'GET',
          path: '/api/products'
        })
        .addResponse({
          status: 200,
          body: test001response
        })

      test001MockServer.start(PORT)
      done()
    })

    it('runs a contract test', done => {
      newman
        .run({
          collection: require('../../src/v2/Contract Test Generator.postman_collection.json'),
          environment: require('../../src/v2/Contract Test Environment.postman_environment.json'),
          envVar: [
            {
              key: 'env-schemaUrl',
              value: 'http://localhost:3558/schema'
            },
            {
              key: 'env-server',
              value: 'http://localhost:3558'
            }
          ]
        })
        .on('start', function (err, args) {
          // on start of run, log to console
          console.log('running a collection...')
        })
        .on('done', function (err, summary) {
          if (err || summary.error) {
            console.error('collection run encountered an error.')
            done(err)
          } else {
            console.log('collection run completed.')
            if (
              summary.run &&
              summary.run.failures &&
              summary.run.failures.length > 0
            ) {
              summary.run.failures.forEach(failure => {
                console.log(
                  'Test: ' +
                    failure.error.test +
                    ' - result: ' +
                    failure.error.message
                )
              })

              done("Test failed.")
            } else {
              done()
            }
          }
        })
    })

    after('finish', done => {
      console.log('stopping server')
      test001MockServer.stop()
      done()
    })
  })

})
