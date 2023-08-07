const assert = require('chai').assert
const newman = require('newman')
const fs = require('fs')
const PostmanMockBuilder = require('@jordanwalsh23/postman-mock-builder')

describe('Postman Contract Test Suite', () => {
  let SCHEMA = './test/schemas/sample-product-schema.json'

  describe('TEST002 - Invalid Response', () => {
    let test002MockServer = null
    before('setup mock server', done => {
      const PORT = 3556

      console.log('Setting up a new mock server')
      test002MockServer = PostmanMockBuilder.create({
        apiVersion: 'TEST002'
      })

      test002MockServer
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

      let test002Response = [{}]

      let state = test002MockServer.addState('An invalid product exists in the database')

      state
        .addRequest({
          method: 'GET',
          path: '/api/products'
        })
        .addResponse({
          status: 200,
          body: test002Response
        })

      test002MockServer.start(PORT)

      test002MockServer.exportCollection('collections/test2.json')
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
              value: 'http://localhost:3556/schema'
            },
            {
              key: 'env-server',
              value: 'http://localhost:3556'
            }
          ],
          reporters: 'cli'
        })
        .on('start', function (err, args) {
          // on start of run, log to console
          console.log('running a collection...')
        })
        .on('request', (err, summary) => {
          console.log(summary.response.stream.toString())
        })
        .on('done', function (err, summary) {
          if (err || summary.error) {
            console.error('collection run encountered an error.')
            done(err)
          } else {
            console.log('collection run completed.')
            console.log(summary.run.failures)

            assert(
              summary.run.failures.length == 1,
              'The failure count was not 1'
            )
            if (
              summary.run &&
              summary.run.failures &&
              summary.run.failures.length > 0
            ) {
              done()
            } else {
              done('This test should have failed.')
            }
          }
        })
    })

    after('finish', done => {
      console.log('stopping server')
      let serverStatus = test002MockServer.stop()
      console.log(serverStatus)
      done()
    })
  })
})
