/*
 * Copyright 2018 Nicolas Lochet Licensed under the Apache License, Version 2.0 (the "License");
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
  , RuleEngine = require(__dirname + '/../lib/RuleEngine.js')
  , Store = require('wool-store').Store
  , Command = require('wool-model').Command
  , chatroomRule = require(__dirname + '/test-rule-chatroom.js')

test('rule-engine with chatroom rules: create msg join msg msg leave leave', async function(t) {
  try {
    let store = new Store()
      , rgine = new RuleEngine(store)
    rgine.addRules(chatroomRule)

    store.set('foo', { membership: [] })
    store.set('bar', { membership: [] })

    let userFoo = await store.get('foo')
      , userBar = await store.get('bar')
    t.deepEqual(userFoo.membership.length, 0)
    t.deepEqual(userBar.membership.length, 0)
    
    await rgine.execute(new Command(Date.now(), 'chatroom:create', {userId: 'foo'}))
    t.deepEqual(userFoo.membership.length, 1)
    t.deepEqual(userBar.membership.length, 0)

    let chatId = userFoo.membership[0]
    let chatroom = await store.get(chatId)
    t.deepEqual(chatroom, { members: [ 'foo' ], messages: [ '* Chatroom created by foo' ] })

    await rgine.execute(new Command(Date.now(), 'chatroom:send', { chatId, userId: 'foo', msg: 'test'}))
    t.deepEqual(chatroom, { members: [ 'foo' ], messages: [ '* Chatroom created by foo', 'foo: test' ] })

    await rgine.execute(new Command(Date.now(), 'chatroom:join', {chatId, userId: 'bar'}))
    t.deepEqual(chatroom, { members: [ 'foo', 'bar' ], messages: [ '* Chatroom created by foo', 'foo: test', '* Chatroom joined by bar' ] })
    t.deepEqual(userBar.membership.length, 1)

    await rgine.execute(new Command(Date.now(), 'chatroom:send', { chatId, userId: 'bar', msg: 'yo'}))
    t.deepEqual(chatroom, { members: [ 'foo', 'bar' ], messages: [ '* Chatroom created by foo', 'foo: test', '* Chatroom joined by bar', 'bar: yo' ] })

    await rgine.execute(new Command(Date.now(), 'chatroom:send', { chatId, userId: 'foo', msg: 'bye'}))
    t.deepEqual(chatroom, { members: [ 'foo', 'bar' ], messages: [ '* Chatroom created by foo', 'foo: test', '* Chatroom joined by bar', 'bar: yo', 'foo: bye' ] })

    await rgine.execute(new Command(Date.now(), 'chatroom:leave', { chatId, userId: 'foo'}))
    t.deepEqual(chatroom, { members: [ 'bar' ], messages: [ '* Chatroom created by foo', 'foo: test', '* Chatroom joined by bar', 'bar: yo', 'foo: bye', '* Chatroom left by foo' ] })
    t.deepEqual(userFoo.membership.length, 0)
    t.deepEqual(userBar.membership.length, 1)

    await rgine.execute(new Command(Date.now(), 'chatroom:leave', { chatId, userId: 'bar'}))
    t.deepEqual(chatroom, { members: [ ], messages: [ '* Chatroom created by foo', 'foo: test', '* Chatroom joined by bar', 'bar: yo', 'foo: bye', '* Chatroom left by foo', '* Chatroom left by bar' ] })
    t.deepEqual(userFoo.membership.length, 0)
    t.deepEqual(userBar.membership.length, 0)

  } catch(e) {
    t.fail(e)
  } finally {
    t.plan(16)
    t.end()
  }
})

test('rule-engine with chatroom rules: create msg join ERR:join msg msg leave leave ERR:msg ERR:leave', async function(t) {
  try {
    let store = new Store()
      , rgine = new RuleEngine(store)
    rgine.addRules(chatroomRule)

    store.set('foo', { membership: [] })
    store.set('bar', { membership: [] })

    let userFoo = await store.get('foo')
      , userBar = await store.get('bar')
    t.deepEqual(userFoo.membership.length, 0)
    t.deepEqual(userBar.membership.length, 0)
    
    await rgine.execute(new Command(Date.now(), 'chatroom:create', {userId: 'foo'}))
    t.deepEqual(userFoo.membership.length, 1)
    t.deepEqual(userBar.membership.length, 0)

    let chatId = userFoo.membership[0]
    let chatroom = await store.get(chatId)
    t.deepEqual(chatroom, { members: [ 'foo' ], messages: [ '* Chatroom created by foo' ] })

    await rgine.execute(new Command(Date.now(), 'chatroom:send', { chatId, userId: 'foo', msg: 'test'}))
    t.deepEqual(chatroom, { members: [ 'foo' ], messages: [ '* Chatroom created by foo', 'foo: test' ] })

    await rgine.execute(new Command(Date.now(), 'chatroom:join', {chatId, userId: 'bar'}))
    t.deepEqual(chatroom, { members: [ 'foo', 'bar' ], messages: [ '* Chatroom created by foo', 'foo: test', '* Chatroom joined by bar' ] })
    t.deepEqual(userBar.membership.length, 1)
    
    try {
      await rgine.execute(new Command(Date.now(), 'chatroom:join', {chatId, userId: 'bar'}))
    } catch(e) {
      t.deepEqual(e.message, 'Chatroom> member "bar" cannot join: already in')
    }

    await rgine.execute(new Command(Date.now(), 'chatroom:send', { chatId, userId: 'bar', msg: 'yo'}))
    t.deepEqual(chatroom, { members: [ 'foo', 'bar' ], messages: [ '* Chatroom created by foo', 'foo: test', '* Chatroom joined by bar', 'bar: yo' ] })

    await rgine.execute(new Command(Date.now(), 'chatroom:send', { chatId, userId: 'foo', msg: 'bye'}))
    t.deepEqual(chatroom, { members: [ 'foo', 'bar' ], messages: [ '* Chatroom created by foo', 'foo: test', '* Chatroom joined by bar', 'bar: yo', 'foo: bye' ] })

    await rgine.execute(new Command(Date.now(), 'chatroom:leave', { chatId, userId: 'foo'}))
    t.deepEqual(chatroom, { members: [ 'bar' ], messages: [ '* Chatroom created by foo', 'foo: test', '* Chatroom joined by bar', 'bar: yo', 'foo: bye', '* Chatroom left by foo' ] })
    t.deepEqual(userFoo.membership.length, 0)
    t.deepEqual(userBar.membership.length, 1)

    await rgine.execute(new Command(Date.now(), 'chatroom:leave', { chatId, userId: 'bar'}))
    t.deepEqual(chatroom, { members: [ ], messages: [ '* Chatroom created by foo', 'foo: test', '* Chatroom joined by bar', 'bar: yo', 'foo: bye', '* Chatroom left by foo', '* Chatroom left by bar' ] })
    t.deepEqual(userFoo.membership.length, 0)
    t.deepEqual(userBar.membership.length, 0)
    
    try {
      await rgine.execute(new Command(Date.now(), 'chatroom:send', { chatId, userId: 'bar', msg: 'yo'}))
    } catch(e) {
      t.deepEqual(e.message, 'Chatroom> member "bar" cannot send message: not in')
    }
    try {
      await rgine.execute(new Command(Date.now(), 'chatroom:leave', { chatId, userId: 'foo'}))
    } catch(e) {
      t.deepEqual(e.message, 'Chatroom> member "foo" cannot leave: not in')
    }

  } catch(e) {
    t.fail(e)
  } finally {
    t.plan(19)
    t.end()
  }
})
