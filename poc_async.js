//http://thecodebarbarian.com/common-async-await-design-patterns-in-node.js.html

/*
const { Transform } = require('stream')

const testStream = new Transform({
  readableObjectMode: true,
  writableObjectMode: true,
  async transform(chunk, encoding, callback) {
    console.log(chunk)
    chunk = await try_async(chunk)
    console.log(chunk)
    this.push(chunk)
    callback()
  }
});

function try_async(value) {
  return new Promise((resolve, reject) => {
    setTimeout(() => resolve(value+'bar'), 1000)
  })
}

testStream.end("foo")
//*/

class Test {
  async run(data){
    console.log(data)
    data = await try_async(data)
    console.log(data)
  }
}

function try_async(value) {
  return new Promise((resolve, reject) => {
    setTimeout(() => resolve(value+'bar'), 1000)
  })
}

const test = new Test()

test.run('foo')