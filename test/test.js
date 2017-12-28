const Client = require('../')

const chai = require('chai')
chai.should()

describe('safedrop-websocket-client', () => {
  let client
  it('should create a client', () => {
    client = new Client('ws://echo.websocket.org')
  })
  it('should trigger open', (done) => {
    client.emitter.once('open', done)
  })
  it('should echo a message', (done) => {
    const message = new Uint8Array([1, 2, 3, 4])
    client.emitter.once('message', (_message) => {
      message.should.deep.equal(_message)
      done()
    })
    client.send(message)
  })
  it('should close', () => {
    client.close()
  })
})