const assert = require('chai').assert
const newman = require('newman')
const fs = require('fs')
const PostmanMockBuilder = require('@jordanwalsh23/postman-mock-builder')

describe('Postman Contract Test Suite - POST Requests', () => {
  let POST_SCHEMA = './test/schemas/sample-product-POST-schema.json'

  describe('TEST001 - POST Valid Response', () => {
    let test001MockServer = null
    before('setup mock server', done => {
      const PORT = 4000

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
          body: JSON.parse(fs.readFileSync(POST_SCHEMA, 'utf-8').toString())
        })

      let test001request = {
        name: 'Bose Noise Cancelling Over-Ear Headphones 700 (Black)',
        description: 'Google Assistant and Amazon Alexa built in',
        model: '794297-0100',
        sku: '394807',
        cost: 445,
        imageUrl: 'https://cdn.shopify.com/s/files/1/0024/9803/5810/products/394807-Product-0-I_d1664990-4dfb-462f-bb93-2fb469ed7d5d_800x800.jpg'
      }

      let test001response = {
        id: 'a1805cde-f34f-4945-9fec-3e096fef4bdd',
        name: 'Bose Noise Cancelling Over-Ear Headphones 700 (Black)',
        description: 'Google Assistant and Amazon Alexa built in',
        model: '794297-0100',
        sku: '394807',
        cost: 445,
        imageUrl: 'https://cdn.shopify.com/s/files/1/0024/9803/5810/products/394807-Product-0-I_d1664990-4dfb-462f-bb93-2fb469ed7d5d_800x800.jpg'
      }

      let state = test001MockServer.addState('A product exists in the database')

      //Successful Response
      state
        .addRequest({
          method: 'POST',
          path: '/api/products',
          headers: {
            'x-mock-match-request-body': true,
            'Content-Type': 'application/json'
          },
          body: test001request
        })
        .addResponse({
          status: 201,
          headers: {
            'Content-Type': 'application/json'
          },
          body: test001response
        })


      //iterate the properties and add requests for removing each one.
      Object.keys(test001response).forEach(property => {

        let propertyBlankState = test001MockServer.addState(`${property} is blank`);

        let requestCopy = JSON.parse(JSON.stringify(test001request));

        requestCopy[property] = "";

        propertyBlankState
          .addRequest({
            method: 'POST',
            path: '/api/products',
            headers: {
              'x-mock-match-request-body': true,
              'Content-Type': 'application/json'
            },
            body: requestCopy
          })
          .addResponse({
            status: 400,
            headers: {
              'x-mock-match-request-body': true,
              'Content-Type': 'application/json'
            },
            body: {
              status: '400',
              error: `Required property: ${property} is blank.`
            }
          })
        
        let propertyUndefinedState = test001MockServer.addState(`${property} is undefined`);

        requestCopy[property] = null

        propertyUndefinedState
          .addRequest({
            method: 'POST',
            path: '/api/products',
            headers: {
              'x-mock-match-request-body': true,
              'Content-Type': 'application/json'
            },
            body: requestCopy
          })
          .addResponse({
            status: 400,
            headers: {
              'x-mock-match-request-body': true,
              'Content-Type': 'application/json'
            },
            body: {
              status: '400',
              error: `Required property: ${property} is empty.`
            }
          })

        let propertyMissingState = test001MockServer.addState(`${property} is missing`);

        delete requestCopy[property]

        propertyMissingState
          .addRequest({
            method: 'POST',
            path: '/api/products',
            headers: {
              'x-mock-match-request-body': true,
              'Content-Type': 'application/json'
            },
            body: requestCopy
          })
          .addResponse({
            status: 400,
            headers: {
              'Content-Type': 'application/json'
            },
            body: {
              status: '400',
              error: `Required property: ${property} is not specified.`
            }
          })
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
              value: 'http://localhost:4000/schema'
            },
            {
              key: 'env-server',
              value: 'http://localhost:4000'
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
})
