/*jslint node:true,bitwise:true*/
/*globals Uint8Array, beforeEach, afterEach, it, expect, jasmine */
var testUtil = require('../../util');

module.exports = function (provider, setup) {
  'use strict';
  var socket, dispatch;
  beforeEach(function () {
    setup();
    dispatch = testUtil.createTestPort('msgs');
    socket = new provider.provider(undefined, dispatch.onMessage.bind(dispatch));
  });

  function rawStringToBuffer(str) {
    var idx, len = str.length, arr = [];
    for (idx = 0; idx < len; idx += 1) {
      arr[idx] = str.charCodeAt(idx) & 0xFF;
    }
    return new Uint8Array(arr).buffer;
  }

  /*it("Works as a Client", function (done) {
    socket.connect('www.google.com', 80, function () {
      console.warn('connected');
      var written = false;
      done();
      socket.write(rawStringToBuffer('GET / HTTP/1.0\n\n'), function (okay) {
        console.warn('written');
        written = true;
      });
      setTimeout(function () {
        expect(written).toBe(true);
        expect(dispatch.gotMessage('onData', [])).not.toEqual(false);
        done();
        socket.close(function () {});
      }, 500);
    });
  });*/

  it("Gets info on client & server sockets", function (done) {
    var cspy = jasmine.createSpy('client'),
      client,
      onconnect = function () {
        client.getInfo(function (info) {
          expect(info.localPort).toBeGreaterThan(1023);
          client.close(function () {});
          socket.close(function () {});
          done();
        });
      };

    socket.listen('127.0.0.1', 0, function () {
      socket.getInfo(function (info) {
        expect(info.localPort).toBeGreaterThan(1023);
        client = new provider.provider(undefined, cspy);
        client.connect('127.0.0.1', info.localPort, onconnect);
      });
    });
  });

  it("Sends from Client to Server", function (done) {
    var cspy = jasmine.createSpy('client'),
      client,
      receiver,
      onDispatch,
      onconnect;

    onDispatch = function (evt, msg) {
      if (evt === 'onDisconnect') {
        return;
      }
      expect(evt).toEqual('onData');
      expect(msg.data.byteLength).toEqual(10);
      done();
      socket.close(function () {});
      client.close(function () {});
      receiver.close(function () {});
    };
    dispatch.gotMessageAsync('onConnection', [], function (msg) {
      console.warn('connection');
      expect(msg.socket).toBeDefined();
      receiver = new provider.provider(undefined, onDispatch, msg.socket);
      console.log('new socket id', msg);
    });
    onconnect = function () {
      console.warn('connected');
      var buf = new Uint8Array(10);
      client.write(buf.buffer, function () {});
    };
    socket.listen('127.0.0.1', 9981, function () {
      console.warn('listening');
      client = new provider.provider(undefined, cspy);
      client.connect('127.0.0.1', 9981, onconnect);
    });
  });

  it("Gives error when connecting to invalid domain", function (done) {
    socket.connect('www.domainexistsbecausesomeonepaidmoneytobreakourtests.gov', 80,
      function (success, err) {
        expect(err.errcode).toBe('CONNECTION_FAILED');
        done();
      });
  });
  // TODO: add tests for tcpsocket.secure, accepting multiple.
};
