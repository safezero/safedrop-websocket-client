const defunction = require('defunction')
const Emitter = require('events')
const Promise = require('bluebird')
const WebSocket = require('ws')

const Client = module.exports = defunction(['string'], '*', function Client(url) {
  this.emitter = new Emitter
  this.url = url
  if (typeof window === 'undefined') {
    this.constructNode()
  } else {
    this.constructBrowser()
  }
})

Client.prototype.constructBrowser = function() {
  this.webSocket = new WebSocket(this.url)
  
  this.webSocket.onopen = () => {
    this.isOpen = true
    this.emitter.emit('open')
  }
  this.webSocket.onmessage = (event) => {
    const blob = event.data
    const fileReader =  new FileReader()
    fileReader.addEventListener('loadend', (e) => {
      const uint8Array = new Uint8Array(e.srcElement.result)
      this.emitter.emit('message', uint8Array)
    })
    fileReader.readAsArrayBuffer(blob)
  }
  this.webSocket.onclose = () => {
    this.emitter.emit('close')
  }
  this.webSocket.error = (error) => {
    this.emitter.emit('error', error)
  }
}

Client.prototype.constructNode = function() {
  this.webSocket = new WebSocket(this.url)
  
  this.webSocket.on('open', () => {
    this.isOpen = true
    this.emitter.emit('open')
  })
  
  this.webSocket.on('message', (message) => {
    this.emitter.emit('message', new Uint8Array(message))
  })

  this.webSocket.on('close', () => {
    this.emitter.emit('close')
  })
  
  this.webSocket.on('error', (error) => {
    this.emitter.emit('error', error)
  })
  
}

Client.prototype.onceOpen = defunction([], '=>Client', function onceOpen() {
  if (this.isOpen) {
    return Promise.resolve(this)
  }
  return new Promise((resolve, reject) => {
    this.emitter.once('open', () => { resolve(this) })
  })
})

Client.prototype.send = defunction(['Uint8Array'], 'undefined', function send(uint8Array) {
  this.onceOpen().then((client) => {
    client.webSocket.send(uint8Array)
  })
})

Client.prototype.close = defunction([], 'undefined', function close(uint8Array) {
  this.webSocket.close()
})