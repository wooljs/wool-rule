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
  , Store = require('wool-state')
  , chatroom = require(__dirname + '/test-rule-chatroom.js')

test('create msg join msg msg leave leave', function(t) {
  var rule = Rule(chatroom, Store())
    , i = 0
    , chatId = null

  rule.push({
    n: 'create_chatroom',
    p: {
      userId: 'foo',
    }
  })

  rule.push({
    n: 'send_message',
    p: {
      userId: 'foo',
      chatId: chatId,
      msg: 'test'
    }
  })

  rule.push({
    n: 'join_chatroom',
    p: {
      userId: 'bar',
      chatId: chatId
    }
  })

  rule.push({
    n: 'send_message',
    p: {
      userId: 'bar',
      chatId: chatId,
      msg: 'yo'
    }
  })

  rule.push({
    n: 'send_message',
    p: {
      userId: 'foo',
      chatId: chatId,
      msg: 'bye'
    }
  })

  rule.push({
    n: 'leave_chatroom',
    p: {
      userId: 'foo',
      chatId: chatId
    }
  })

  rule.push({
    n: 'leave_chatroom',
    p: {
      userId: 'bar',
      chatId: chatId
    }
  })

  t.plan(11)
  t.end()
})

/*
  function(id, value) {
      chatId = id
      switch (i) {
      case 0:
        t.deepEqual(value, { members: [ 'foo' ], messages: [ '* Chatroom created by foo' ] }, 'Call: '+i)
        break
      case 1:
        t.deepEqual(value, { members: [ 'foo' ], messages: [
          '* Chatroom created by foo',
          'foo: test'
        ] }, 'Call: '+i)
        break
      case 2:
        t.deepEqual(value, { members: [ 'foo', 'bar' ], messages: [
          '* Chatroom created by foo',
          'foo: test',
          '* Chatroom joined by bar'
        ] }, 'Call: '+i)
        break
      case 4:
        t.deepEqual(value, { members: [ 'foo', 'bar' ], messages: [
          '* Chatroom created by foo',
          'foo: test',
          '* Chatroom joined by bar',
          'bar: yo'
        ] }, 'Call: '+i)
        break
      case 6:
        t.deepEqual(value, { members: [ 'foo', 'bar' ], messages: [
          '* Chatroom created by foo',
          'foo: test',
          '* Chatroom joined by bar',
          'bar: yo',
          'foo: bye'
        ] }, 'Call: '+i)
        break
      case 8:
        t.deepEqual(value, { members: [ 'bar' ], messages: [
          '* Chatroom created by foo',
          'foo: test',
          '* Chatroom joined by bar',
          'bar: yo',
          'foo: bye',
          '* Chatroom left by foo'
        ] }, 'Call: '+i)
        break
      default:
        t.fail('no such call')
        break
      }
      i += 1
    }
  }
  
  function(id, value) {
    switch (i) {
    case 3:
      t.deepEqual(value, { members: [ 'foo', 'bar' ], messages: [
        '* Chatroom created by foo', 'foo: test',
        '* Chatroom joined by bar'
      ] }, 'Call: '+i)
      break
    case 5:
      t.deepEqual(value, { members: [ 'foo', 'bar' ], messages: [
        '* Chatroom created by foo', 'foo: test',
        '* Chatroom joined by bar',
        'bar: yo'
      ] }, 'Call: '+i)
      break
    case 7:
      t.deepEqual(value, { members: [ 'foo', 'bar' ], messages: [
        '* Chatroom created by foo',
        'foo: test', '* Chatroom joined by bar',
        'bar: yo',
        'foo: bye'
      ] }, 'Call: '+i)
      break
    case 9:
      t.deepEqual(value, { members: [ 'bar' ], messages: [
        '* Chatroom created by foo', 'foo: test',
        '* Chatroom joined by bar',
        'bar: yo',
        'foo: bye',
        '* Chatroom left by foo'
      ] }, 'Call: '+i)
      break
    case 10:
      t.deepEqual(value, { members: [], messages: [
        '* Chatroom created by foo', 'foo: test',
        '* Chatroom joined by bar',
        'bar: yo',
        'foo: bye',
        '* Chatroom left by foo',
        '* Chatroom left by bar'
      ] }, 'Call: '+i)
      break
    default:
      t.fail('no such call')
      break
    }
    i += 1
  }

*/