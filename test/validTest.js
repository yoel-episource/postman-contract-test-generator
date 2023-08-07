const assert = require('chai').assert
const newman = require('newman')
const fs = require('fs')
const PostmanMockBuilder = require('@jordanwalsh23/postman-mock-builder')

describe('Postman Contract Test Suite', () => {
  let SCHEMA = './test/schemas/sample-product-schema.json'

  describe('TEST001 - Valid Response', () => {
    let test001MockServer = null
    before('setup mock server', done => {
      const PORT = 3555

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
          body: JSON.parse(fs.readFileSync(SCHEMA, 'utf-8').toString())
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

      let state = test001MockServer.addState('A product exists in the database')

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
          collection: require('../src/Contract Test Generator.postman_collection.json'),
          environment: require('../src/Contract Test Environment.postman_environment.json'),
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
      let serverStatus = test001MockServer.stop()
      console.log(serverStatus)
      done()
    })
  })
})
