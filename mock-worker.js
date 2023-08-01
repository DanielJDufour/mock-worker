function MockWorker({ debug_level = 0, onload }) {
  const worker = {
    __handlers__: {},
    __terminated__: false
  };

  const self = {
    postMessage: msg => {
      if (debug_level >= 2) console.log("[mock-worker] worker posting message up:", msg);
      worker.dispatchEvent(new MessageEvent("message", { data: msg }));
    }
  };
  self.self = self;
  worker.addEventListener = (type, handler) => {
    if (debug_level >= 2) console.log(`[mock-worker] adding event listener for "${type}" events`, handler);
    worker.__handlers__[type] ??= [];
    worker.__handlers__[type].push(handler);
  };
  worker.dispatchEvent = evt => {
    if (worker.__terminated__) return;

    if (debug_level >= 2) console.log("[mock-worker] dispatching event to worker with data:", evt.data);

    if (evt.type === "message" && worker.onmessage) {
      worker.onmessage(evt);
    }

    if (!worker.__handlers__[evt.type]) return;

    worker.__handlers__[evt.type].forEach(handler => {
      handler(evt);
    });
  };
  worker.postMessage = msg => {
    if (worker.__terminated__) throw new Error("[mock-worker] can't post message because the worker is terminated");
    if (debug_level >= 2) console.log("[mock-worker] posting message to attached worker:", msg);
    if (typeof self.onmessage === "function") {
      setTimeout(function () {
        self.onmessage(new MessageEvent("message", { data: msg }));
      }, 0);
    }
  };
  worker.removeEventListener = (type, handler) => {
    if (debug_level >= 2) console.log(`[mock-worker] removing event listener for "${type}" events`, handler);
    if (handler && worker.__handlers__[type]) {
      worker.__handlers__[type] = worker.__handlers__[type].filter(h => h !== handler);
    }
  };
  worker.terminate = function terminate() {
    worker.__terminated__ = true;
  };

  if (onload) onload(self);

  return worker;
}

module.exports = MockWorker;
module.exports.default = MockWorker;
