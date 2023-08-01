# mock-worker
Fake Web Worker for Testing

### install
```
npm install mock-worker
```

### usage
```js
const MockWorker = require("mock-worker");

// create a mock web worker that returns
// a JSON string representation of messages
const worker = MockWorker({
  onload: ({ self }) => {
    self.onmessage = evt => {
      self.postMessage(JSON.stringify(evt.data));
    };
  }
});

// set message handler
worker.onmessage = evt => { ... };

// attach additional messsage handlers
worker.addEventListener("message", ...);

// remove event listener
worker.removeEventListener("message", ...);

// send message to the fake web worker
worker.postMessage([1,2,3]);

// stop processing
worker.terminate();
```