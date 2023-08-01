const test = require("flug");
const MockWorker = require("./mock-worker.js");

const until = fn => {
  return new Promise(resolve => {
    const intervalId = setInterval(() => {
      if (fn()) {
        clearInterval(intervalId);
        resolve();
      }
    }, 50);
  });
};

const onload = ({ self }) => {
  self.onmessage = evt => {
    self.postMessage(JSON.stringify(evt.data));
  };
};

test("setting worker.onmessage", async ({ eq }) => {
  const options = { debug_level: 10, onload };
  const worker = MockWorker(options);
  let result = null;
  worker.onmessage = evt => (result = evt.data);
  // setting onmessage doesn't add to __handlers__
  eq(worker.__handlers__.message, undefined);
  worker.postMessage([1, 2, 3]);
  await until(() => result !== null);
  eq(worker.__handlers__.message, undefined);
  eq(result, "[1,2,3]");
});

test("calling worker.addEventListener", async ({ eq }) => {
  const options = { debug_level: 10, onload };
  const worker = MockWorker(options);
  let result = null;
  const handler = evt => (result = evt.data);
  worker.addEventListener("message", handler);
  eq(worker.__handlers__.message.length, 1);
  worker.postMessage([1, 2, 3]);
  await until(() => result !== null);
  eq(worker.__handlers__.message.length, 1);
  eq(result, "[1,2,3]");
  worker.removeEventListener("message", handler);
  eq(worker.__handlers__.message.length, 0);
});

test("calling worker.terminate", async ({ eq }) => {
  const options = { debug_level: 10, onload };
  const worker = MockWorker(options);
  worker.terminate();
  let msg;
  try {
    worker.postMessage([1, 2, 3]);
  } catch (error) {
    msg = error.message;
  }
  eq(msg, "[mock-worker] can't post message because the worker is terminated");
});
