/*
 * Copyright 2017 Nicolas Lochet Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the License is
 * distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and limitations under the License.
 */

'use strict'

var test = require('tape')
  , Rule = require(__dirname + '/../index.js')
  , Store = require('wool-store')
  , chatroom = require(__dirname + '/test-rule-chatroom.js')

test('create msg join msg msg leave leave', function(t) {
  var store = Store()
    , rule = Rule(chatroom, store)
    , i = 0
    , chatId
    , sub = function(id, value) {
      switch (i) {
      case 0:
        t.deepEqual(value, { members: [ 'foo' ], messages: [ '* Chatroom created by foo' ] }, 'Call 0: '+i)
        break
      case 1:
        t.deepEqual(value, { members: [ 'foo' ], messages: [
          '* Chatroom created by foo',
          'foo: test'
        ] }, 'Call 1: '+i)
        break
      case 2:
        t.deepEqual(value, { members: [ 'foo', 'bar' ], messages: [
          '* Chatroom created by foo',
          'foo: test',
          '* Chatroom joined by bar'
        ] }, 'Call 2: '+i)
        break
      case 3:
        t.deepEqual(value, { members: [ 'foo', 'bar' ], messages: [
          '* Chatroom created by foo',
          'foo: test',
          '* Chatroom joined by bar',
          'bar: yo'
        ] }, 'Call 3: '+i)
        break
      case 4:
        t.deepEqual(value, { members: [ 'foo', 'bar' ], messages: [
          '* Chatroom created by foo',
          'foo: test',
          '* Chatroom joined by bar',
          'bar: yo',
          'foo: bye'
        ] }, 'Call 4: '+i)
        break
      case 5:
        t.deepEqual(value, { members: [ 'bar' ], messages: [
          '* Chatroom created by foo',
          'foo: test',
          '* Chatroom joined by bar',
          'bar: yo',
          'foo: bye',
          '* Chatroom left by foo'
        ] }, 'Call 5: '+i)
        break
      case 6:
        t.deepEqual(value, { members: [], messages: [
          '* Chatroom created by foo', 'foo: test',
          '* Chatroom joined by bar',
          'bar: yo',
          'foo: bye',
          '* Chatroom left by foo',
          '* Chatroom left by bar'
        ] }, 'Call 6: '+i)
        break
      default:
        t.fail('no such call')
        break
      }
      i += 1
    }
    , init = function(err, data) {
      if (err) {
        // console.log(err)
        t.fail(err.toString())
      }
      chatId = data.chatId
      store.sub(chatId, 'test', sub, true)
      t.ok(data)
    }
    , cb = function(err, data) {
      if (err) {
        // console.log(err)
        t.fail(err.toString())
      } else {
        t.equal(data, undefined)
      }
    }

  rule.push({
    n: 'create_chatroom',
    d: {
      userId: 'foo',
    }
  }, init)

  rule.push({
    n: 'send_message',
    d: {
      userId: 'foo',
      chatId: chatId,
      msg: 'test'
    }
  }, cb)

  rule.push({
    n: 'join_chatroom',
    d: {
      userId: 'bar',
      chatId: chatId
    }
  }, cb)

  rule.push({
    n: 'send_message',
    d: {
      userId: 'bar',
      chatId: chatId,
      msg: 'yo'
    }
  }, cb)

  rule.push({
    n: 'send_message',
    d: {
      userId: 'foo',
      chatId: chatId,
      msg: 'bye'
    }
  }, cb)

  rule.push({
    n: 'leave_chatroom',
    d: {
      userId: 'foo',
      chatId: chatId
    }
  }, cb)

  rule.push({
    n: 'leave_chatroom',
    d: {
      userId: 'bar',
      chatId: chatId
    }
  }, cb)

  t.plan(14)
  t.end()
})

test('create msg join ERR:join msg msg leave leave ERR:msg ERR:leave', function(t) {
  var store = Store()
    , rule = Rule(chatroom, store)
    , i = 0
    , chatId
    , sub = function(id, value) {
      switch (i) {
      case 0:
        t.deepEqual(value, { members: [ 'foo' ], messages: [ '* Chatroom created by foo' ] }, 'Call 0: '+i)
        break
      case 1:
        t.deepEqual(value, { members: [ 'foo' ], messages: [
          '* Chatroom created by foo',
          'foo: test'
        ] }, 'Call 1: '+i)
        break
      case 2:
        t.deepEqual(value, { members: [ 'foo', 'bar' ], messages: [
          '* Chatroom created by foo',
          'foo: test',
          '* Chatroom joined by bar'
        ] }, 'Call 2: '+i)
        break
      case 3:
        t.deepEqual(value, { members: [ 'foo', 'bar' ], messages: [
          '* Chatroom created by foo',
          'foo: test',
          '* Chatroom joined by bar',
          'bar: yo'
        ] }, 'Call 3: '+i)
        break
      case 4:
        t.deepEqual(value, { members: [ 'foo', 'bar' ], messages: [
          '* Chatroom created by foo',
          'foo: test',
          '* Chatroom joined by bar',
          'bar: yo',
          'foo: bye'
        ] }, 'Call 4: '+i)
        break
      case 5:
        t.deepEqual(value, { members: [ 'bar' ], messages: [
          '* Chatroom created by foo',
          'foo: test',
          '* Chatroom joined by bar',
          'bar: yo',
          'foo: bye',
          '* Chatroom left by foo'
        ] }, 'Call 5: '+i)
        break
      case 6:
        t.deepEqual(value, { members: [], messages: [
          '* Chatroom created by foo', 'foo: test',
          '* Chatroom joined by bar',
          'bar: yo',
          'foo: bye',
          '* Chatroom left by foo',
          '* Chatroom left by bar'
        ] }, 'Call 6: '+i)
        break
      default:
        t.fail('no such call')
        break
      }
      i += 1
    }
    , init = function(err, data) {
      if (err) {
        // console.log(err)
        return t.fail(err.toString())
      }
      chatId = data.chatId
      store.sub(chatId, 'test', sub, true)
      t.ok(data)
    }
    , cb = function(err, data) {
      if (err) {
        // console.log(err)
        t.fail(err.toString())
      } else {
        t.equal(data, undefined)
      }
    }
    , cbErr = function(msg) {
      return function(err) {
        if (err) {
          // console.log(err)
          t.equal(err.toString(), msg)        
        } else {
          t.fail('should have failed')
        }
      }
    }

  rule.push({
    n: 'create_chatroom',
    d: {
      userId: 'foo',
    }
  }, init)

  rule.push({
    n: 'send_message',
    d: {
      userId: 'foo',
      chatId: chatId,
      msg: 'test'
    }
  }, cb)

  rule.push({
    n: 'join_chatroom',
    d: {
      userId: 'bar',
      chatId: chatId
    }
  }, cb)

  rule.push({
    n: 'join_chatroom',
    d: {
      userId: 'bar',
      chatId: chatId
    }
  }, cbErr('Chatroom> member "bar" cannot join: already in'))

  rule.push({
    n: 'send_message',
    d: {
      userId: 'bar',
      chatId: chatId,
      msg: 'yo'
    }
  }, cb)

  rule.push({
    n: 'send_message',
    d: {
      userId: 'foo',
      chatId: chatId,
      msg: 'bye'
    }
  }, cb)

  rule.push({
    n: 'leave_chatroom',
    d: {
      userId: 'foo',
      chatId: chatId
    }
  }, cb)

  rule.push({
    n: 'leave_chatroom',
    d: {
      userId: 'bar',
      chatId: chatId
    }
  }, cb)

  rule.push({
    n: 'send_message',
    d: {
      userId: 'bar',
      chatId: chatId,
      msg: 'yo'
    }
  }, cbErr('Chatroom> member "bar" cannot send message: not in'))

  rule.push({
    n: 'leave_chatroom',
    d: {
      userId: 'foo',
      chatId: chatId
    }
  }, cbErr('Chatroom> member "foo" cannot leave: not in'))
  
  t.plan(17)
  t.end()
})
