/*
 * Peer 2 Peer transport provider.
 *
 */
console.log("TransportProvider: " + self.location.href);

function TransportProvider() {
  this.pc = freedom['core.sctp-peerconnection']();
  this.pc.on('onReceived', this.onData.bind(this));
  this.pc.on('onClose', this.onClose.bind(this));
}

// The argument |channelId| is a freedom communication channel id to use
// to open a peer connection. 
TransportProvider.prototype.setup = function(name, channelId, continuation) {
  console.log("TransportProvider.setup." + name);
  var promise = this.pc.setup(channelId, name);
  promise.done(continuation);
};

TransportProvider.prototype.send = function(tag, data, continuation) {
  var promise;
  if (data instanceof ArrayBuffer) {
    console.log("TransportProvider.sending ArrayBuffer");
    promise = this.pc.send({"channelLabel": tag, "buffer": data});
  } else {
    console.error('Trying to send an unsupported type of object: ' + typeof(data));
    return;
  }
  promise.done(continuation);
};

TransportProvider.prototype.close = function(continuation) {
  this.pc.close().done(continuation);
};

// Called when the peer-connection receives data, it then passes it here.
TransportProvider.prototype.onData = function(msg) {
  console.log("TransportProvider.prototype.message: Got Message:" + JSON.stringify(msg));
  if (msg.buffer) {
    this.dispatchEvent('onData', {
      "tag": msg.channelLabel, 
      "data": msg.buffer
    });
  } else if (msg.text) {
    console.error("Strings not supported.");
  } else if (msg.blob) {
    console.error('Blob is not supported. ');
  } else {
    console.error('message called without a valid data field');
  }
};

TransportProvider.prototype.onClose = function() {
  this.dispatchEvent('onClose', null);
};

// Note: freedom.transport() does not create a new transport instance here: for
// module definitions freedom.transport() gets the module-constructor-freedom-
// thing.
//
// TODO: change Freedom API so that it distinctly names the module-
// constructor-freedom-thing separately from the thing to create new modules.
var transport = freedom.transport();
transport.provideAsynchronous(TransportProvider);
