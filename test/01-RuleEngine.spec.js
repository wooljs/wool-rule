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

const test = require('tape-async')
  , RuleEngine = require(__dirname + '/../lib/RuleEngine.js')
  , { Store } = require('wool-store')
  , { Command, Event } = require('wool-model')
  , chatroomRule = require(__dirname + '/test-rule-chatroom.js')

test('rule-engine execute command with chatroom rules: create msg join msg msg leave leave', async function(t) {
  try {
    let store = new Store()
      , rgine = new RuleEngine(store)
      , ev = null
      , d = null
      , chatId = null
    rgine.addRules(chatroomRule)

    await store.set('foo', { membership: [] })
    await store.set('bar', { membership: [] })

    let userFoo = await store.get('foo')
      , userBar = await store.get('bar')
    t.deepEqual(userFoo.membership.length, 0)
    t.deepEqual(userBar.membership.length, 0)

    ev = await rgine.execute(new Command(d = new Date(), 0, 'chatroom:create', {userId: 'foo'}))
    t.deepEqual(userFoo.membership.length, 1)
    chatId = userFoo.membership[0]
    t.deepEqual(userBar.membership.length, 0)
    t.deepEqual(ev.stringify(), 'S: '+d.toISOString()+'-0000 chatroom:create {"userId":"foo","chatId":"'+chatId+'"}')

    let chatroom = ev = await store.get(chatId)
    t.deepEqual(chatroom, { members: [ 'foo' ], messages: [ '* Chatroom created by foo' ] })

    ev = await rgine.execute(new Command(d = new Date(), 0, 'chatroom:send', { chatId, userId: 'foo', msg: 'test'}))
    t.deepEqual(chatroom, { members: [ 'foo' ], messages: [ '* Chatroom created by foo', 'foo: test' ] })
    t.deepEqual(ev.stringify(), 'S: '+d.toISOString()+'-0000 chatroom:send {"chatId":"'+chatId+'","userId":"foo","msg":"test"}')

    ev = await rgine.execute(new Command(d = new Date(), 0, 'chatroom:join', {chatId, userId: 'bar'}))
    t.deepEqual(chatroom, { members: [ 'foo', 'bar' ], messages: [ '* Chatroom created by foo', 'foo: test', '* Chatroom joined by bar' ] })
    t.deepEqual(userBar.membership.length, 1)
    t.deepEqual(ev.stringify(), 'S: '+d.toISOString()+'-0000 chatroom:join {"chatId":"'+chatId+'","userId":"bar"}')

    ev = await rgine.execute(new Command(d = new Date(), 0, 'chatroom:send', { chatId, userId: 'bar', msg: 'yo'}))
    t.deepEqual(chatroom, { members: [ 'foo', 'bar' ], messages: [ '* Chatroom created by foo', 'foo: test', '* Chatroom joined by bar', 'bar: yo' ] })
    t.deepEqual(ev.stringify(), 'S: '+d.toISOString()+'-0000 chatroom:send {"chatId":"'+chatId+'","userId":"bar","msg":"yo"}')

    ev = await rgine.execute(new Command(d = new Date(), 0, 'chatroom:send', { chatId, userId: 'foo', msg: 'bye'}))
    t.deepEqual(chatroom, { members: [ 'foo', 'bar' ], messages: [ '* Chatroom created by foo', 'foo: test', '* Chatroom joined by bar', 'bar: yo', 'foo: bye' ] })
    t.deepEqual(ev.stringify(), 'S: '+d.toISOString()+'-0000 chatroom:send {"chatId":"'+chatId+'","userId":"foo","msg":"bye"}')

    ev = await rgine.execute(new Command(d = new Date(), 0, 'chatroom:leave', { chatId, userId: 'foo'}))
    t.deepEqual(chatroom, { members: [ 'bar' ], messages: [ '* Chatroom created by foo', 'foo: test', '* Chatroom joined by bar', 'bar: yo', 'foo: bye', '* Chatroom left by foo' ] })
    t.deepEqual(userFoo.membership.length, 0)
    t.deepEqual(userBar.membership.length, 1)
    t.deepEqual(ev.stringify(), 'S: '+d.toISOString()+'-0000 chatroom:leave {"chatId":"'+chatId+'","userId":"foo"}')

    ev = await rgine.execute(new Command(d = new Date(), 0, 'chatroom:leave', { chatId, userId: 'bar'}))
    t.deepEqual(chatroom, { members: [ ], messages: [ '* Chatroom created by foo', 'foo: test', '* Chatroom joined by bar', 'bar: yo', 'foo: bye', '* Chatroom left by foo', '* Chatroom left by bar' ] })
    t.deepEqual(userFoo.membership.length, 0)
    t.deepEqual(userBar.membership.length, 0)
    t.deepEqual(ev.stringify(), 'S: '+d.toISOString()+'-0000 chatroom:leave {"chatId":"'+chatId+'","userId":"bar"}')

  } catch(e) {
    t.fail(e.message +'\n'+ e.stack)
  } finally {
    t.plan(23)
    t.end()
  }
})

test('rule-engine execute command with chatroom rules: create msg join I:join msg E:err msg leave leave I:msg I:leave', async function(t) {
  try {
    let store = new Store()
      , rgine = new RuleEngine(store)
      , ev = null
      , d = null
      , chatId = null
    rgine.addRules(chatroomRule)

    store.set('foo', { membership: [] })
    store.set('bar', { membership: [] })

    let userFoo = await store.get('foo')
      , userBar = await store.get('bar')
    t.deepEqual(userFoo.membership.length, 0)
    t.deepEqual(userBar.membership.length, 0)

    ev = await rgine.execute(new Command(d = new Date(), 0, 'chatroom:create', {userId: 'foo'}))
    t.deepEqual(userFoo.membership.length, 1)
    chatId = userFoo.membership[0]
    t.deepEqual(userBar.membership.length, 0)
    t.deepEqual(ev.stringify(), 'S: '+d.toISOString()+'-0000 chatroom:create {"userId":"foo","chatId":"'+chatId+'"}')

    let chatroom = ev = await store.get(chatId)
    t.deepEqual(chatroom, { members: [ 'foo' ], messages: [ '* Chatroom created by foo' ] })

    ev = await rgine.execute(new Command(d = new Date(), 0, 'chatroom:send', { chatId, userId: 'foo', msg: 'test'}))
    t.deepEqual(chatroom, { members: [ 'foo' ], messages: [ '* Chatroom created by foo', 'foo: test' ] })
    t.deepEqual(ev.stringify(), 'S: '+d.toISOString()+'-0000 chatroom:send {"chatId":"'+chatId+'","userId":"foo","msg":"test"}')

    ev = await rgine.execute(new Command(d = new Date(), 0, 'chatroom:join', {chatId, userId: 'bar'}))
    t.deepEqual(chatroom, { members: [ 'foo', 'bar' ], messages: [ '* Chatroom created by foo', 'foo: test', '* Chatroom joined by bar' ] })
    t.deepEqual(userBar.membership.length, 1)
    t.deepEqual(ev.stringify(), 'S: '+d.toISOString()+'-0000 chatroom:join {"chatId":"'+chatId+'","userId":"bar"}')

    ev = await rgine.execute(new Command(d = new Date(), 0, 'chatroom:join', {chatId, userId: 'bar'}))
    t.deepEqual(ev.stringify(), 'I: '+d.toISOString()+'-0000 chatroom:join {"chatId":"'+chatId+'","userId":"bar"} Chatroom%3E%20member%20%22bar%22%20cannot%20join%3A%20already%20in')

    ev = await rgine.execute(new Command(d = new Date(), 0, 'chatroom:send', { chatId, userId: 'bar', msg: 'yo'}))
    t.deepEqual(chatroom, { members: [ 'foo', 'bar' ], messages: [ '* Chatroom created by foo', 'foo: test', '* Chatroom joined by bar', 'bar: yo' ] })
    t.deepEqual(ev.stringify(), 'S: '+d.toISOString()+'-0000 chatroom:send {"chatId":"'+chatId+'","userId":"bar","msg":"yo"}')

    ev = await rgine.execute(new Command(d = new Date(), 0, 'chatroom:err', {}))
    let str = ev.stringify()
    //console.log(str)
    t.ok(str.match('^E: '+d.toISOString()+'-0000 chatroom:err {} ERROR!%0AError%3A%20ERROR!%0A%20%20%20%20at%20Rule.run%20\\(.*%2Fwool-rule%2Ftest%2Ftest-rule-chatroom.js%3A..%3A11\\)%0A%20%20%20%20at%20Rule.apply%20\\(.*%2Fwool-rule%2Flib%2FRule.js%3A\\d+%3A\\d+\\)%0A%20%20%20%20at%20RuleEngine.execute%20\\(.*%2Fwool-rule%2Flib%2FRuleEngine.js%3A\\d+%3A\\d+\\).*$'), 'evaluate by regex fail')

    ev = await rgine.execute(new Command(d = new Date(), 0, 'chatroom:send', { chatId, userId: 'foo', msg: 'bye'}))
    t.deepEqual(chatroom, { members: [ 'foo', 'bar' ], messages: [ '* Chatroom created by foo', 'foo: test', '* Chatroom joined by bar', 'bar: yo', 'foo: bye' ] })
    t.deepEqual(ev.stringify(), 'S: '+d.toISOString()+'-0000 chatroom:send {"chatId":"'+chatId+'","userId":"foo","msg":"bye"}')

    ev = await rgine.execute(new Command(d = new Date(), 0, 'chatroom:leave', { chatId, userId: 'foo'}))
    t.deepEqual(chatroom, { members: [ 'bar' ], messages: [ '* Chatroom created by foo', 'foo: test', '* Chatroom joined by bar', 'bar: yo', 'foo: bye', '* Chatroom left by foo' ] })
    t.deepEqual(userFoo.membership.length, 0)
    t.deepEqual(userBar.membership.length, 1)
    t.deepEqual(ev.stringify(), 'S: '+d.toISOString()+'-0000 chatroom:leave {"chatId":"'+chatId+'","userId":"foo"}')

    ev = await rgine.execute(new Command(d = new Date(), 0, 'chatroom:leave', { chatId, userId: 'bar'}))
    t.deepEqual(chatroom, { members: [ ], messages: [ '* Chatroom created by foo', 'foo: test', '* Chatroom joined by bar', 'bar: yo', 'foo: bye', '* Chatroom left by foo', '* Chatroom left by bar' ] })
    t.deepEqual(userFoo.membership.length, 0)
    t.deepEqual(userBar.membership.length, 0)
    t.deepEqual(ev.stringify(), 'S: '+d.toISOString()+'-0000 chatroom:leave {"chatId":"'+chatId+'","userId":"bar"}')

    ev = await rgine.execute(new Command(d = new Date(), 0, 'chatroom:send', { chatId, userId: 'bar', msg: 'yo'}))
    t.deepEqual(ev.stringify(), 'I: '+d.toISOString()+'-0000 chatroom:send {"chatId":"'+chatId+'","userId":"bar","msg":"yo"} Chatroom%3E%20member%20%22bar%22%20cannot%20send%20message%3A%20not%20in')

    ev = await rgine.execute(new Command(d = new Date(), 0, 'chatroom:leave', { chatId, userId: 'foo'}))
    t.deepEqual(ev.stringify(), 'I: '+d.toISOString()+'-0000 chatroom:leave {"chatId":"'+chatId+'","userId":"foo"} Chatroom%3E%20member%20%22foo%22%20cannot%20leave%3A%20not%20in')

  } catch(e) {
    t.fail(e.message +'\n'+ e.stack)
  } finally {
    t.plan(27)
    t.end()
  }
})

test('rule-engine replay event with chatroom rules: create msg join I:join msg msg E:err leave leave I:msg I:leave', async function(t) {
  try {
    let store = new Store()
      , rgine = new RuleEngine(store)
      , ev = null
      , d = null
      , chatId = '42'
    rgine.addRules(chatroomRule)

    store.set('foo', { membership: [] })
    store.set('bar', { membership: [] })

    let userFoo = await store.get('foo')
      , userBar = await store.get('bar')
    t.deepEqual(userFoo.membership.length, 0)
    t.deepEqual(userBar.membership.length, 0)

    ev = await rgine.replay(new Event(d = new Date(), 0, 'chatroom:create', {chatId, userId: 'foo'}, 'S'))
    t.deepEqual(userFoo.membership.length, 1)
    t.deepEqual(userFoo.membership[0], chatId)
    t.deepEqual(userBar.membership.length, 0)
    t.deepEqual(ev.stringify(), 'S: '+d.toISOString()+'-0000 chatroom:create {"chatId":"'+chatId+'","userId":"foo"}')

    let chatroom = ev = await store.get(chatId)
    t.deepEqual(chatroom, { members: [ 'foo' ], messages: [ '* Chatroom created by foo' ] })

    ev = await rgine.replay(new Event(d = new Date(), 0, 'chatroom:send', { chatId, userId: 'foo', msg: 'test'}, 'S'))
    t.deepEqual(chatroom, { members: [ 'foo' ], messages: [ '* Chatroom created by foo', 'foo: test' ] })
    t.deepEqual(ev.stringify(), 'S: '+d.toISOString()+'-0000 chatroom:send {"chatId":"'+chatId+'","userId":"foo","msg":"test"}')

    ev = await rgine.replay(new Event(d = new Date(), 0, 'chatroom:join', {chatId, userId: 'bar'}, 'S'))
    t.deepEqual(chatroom, { members: [ 'foo', 'bar' ], messages: [ '* Chatroom created by foo', 'foo: test', '* Chatroom joined by bar' ] })
    t.deepEqual(userBar.membership.length, 1)
    t.deepEqual(ev.stringify(), 'S: '+d.toISOString()+'-0000 chatroom:join {"chatId":"'+chatId+'","userId":"bar"}')

    ev = await rgine.replay(new Event(d = new Date(), 0, 'chatroom:join', {chatId, userId: 'bar'}, 'I', 'Chatroom> member "bar" cannot join: already in'))
    t.deepEqual(chatroom, { members: [ 'foo', 'bar' ], messages: [ '* Chatroom created by foo', 'foo: test', '* Chatroom joined by bar' ] })
    t.deepEqual(userBar.membership.length, 1)
    t.deepEqual(ev.stringify(), 'I: '+d.toISOString()+'-0000 chatroom:join {"chatId":"'+chatId+'","userId":"bar"} Chatroom%3E%20member%20%22bar%22%20cannot%20join%3A%20already%20in')

    ev = await rgine.replay(new Event(d = new Date(), 0, 'chatroom:send', { chatId, userId: 'bar', msg: 'yo'}, 'S'))
    t.deepEqual(chatroom, { members: [ 'foo', 'bar' ], messages: [ '* Chatroom created by foo', 'foo: test', '* Chatroom joined by bar', 'bar: yo' ] })
    t.deepEqual(ev.stringify(), 'S: '+d.toISOString()+'-0000 chatroom:send {"chatId":"'+chatId+'","userId":"bar","msg":"yo"}')

    ev = await rgine.replay(new Event(d = new Date(), 0, 'chatroom:send', { chatId, userId: 'foo', msg: 'bye'}, 'S'))
    t.deepEqual(chatroom, { members: [ 'foo', 'bar' ], messages: [ '* Chatroom created by foo', 'foo: test', '* Chatroom joined by bar', 'bar: yo', 'foo: bye' ] })

    ev = await rgine.replay(new Event(d = new Date(), 0, 'chatroom:err', {}, 'E', 'ERROR!\nError: ERROR!\n    at Rule.run (/home/n3/sources/repo/wool-rule/test/test-rule-chatroom.js:104:11)\n    at Rule.apply (/home/n3/sources/repo/wool-rule/lib/Rule.js:57:16)\n    at RuleEngine.execute (/home/n3/sources/repo/wool-rule/lib/RuleEngine.js:35:20)\n    at <anonymous>\n    at process._tickCallback (internal/process/next_tick.js:188:7)'))
    t.deepEqual(ev.stringify(), 'E: '+d.toISOString()+'-0000 chatroom:err {} ERROR!%0AError%3A%20ERROR!%0A%20%20%20%20at%20Rule.run%20(%2Fhome%2Fn3%2Fsources%2Frepo%2Fwool-rule%2Ftest%2Ftest-rule-chatroom.js%3A104%3A11)%0A%20%20%20%20at%20Rule.apply%20(%2Fhome%2Fn3%2Fsources%2Frepo%2Fwool-rule%2Flib%2FRule.js%3A57%3A16)%0A%20%20%20%20at%20RuleEngine.execute%20(%2Fhome%2Fn3%2Fsources%2Frepo%2Fwool-rule%2Flib%2FRuleEngine.js%3A35%3A20)%0A%20%20%20%20at%20%3Canonymous%3E%0A%20%20%20%20at%20process._tickCallback%20(internal%2Fprocess%2Fnext_tick.js%3A188%3A7)')

    ev = await rgine.replay(new Event(d = new Date(), 0, 'chatroom:leave', { chatId, userId: 'foo'}, 'S'))
    t.deepEqual(chatroom, { members: [ 'bar' ], messages: [ '* Chatroom created by foo', 'foo: test', '* Chatroom joined by bar', 'bar: yo', 'foo: bye', '* Chatroom left by foo' ] })
    t.deepEqual(userFoo.membership.length, 0)
    t.deepEqual(userBar.membership.length, 1)
    t.deepEqual(ev.stringify(), 'S: '+d.toISOString()+'-0000 chatroom:leave {"chatId":"'+chatId+'","userId":"foo"}')

    ev = await rgine.replay(new Event(d = new Date(), 0, 'chatroom:leave', { chatId, userId: 'bar'}, 'S'))
    t.deepEqual(chatroom, { members: [ ], messages: [ '* Chatroom created by foo', 'foo: test', '* Chatroom joined by bar', 'bar: yo', 'foo: bye', '* Chatroom left by foo', '* Chatroom left by bar' ] })
    t.deepEqual(userFoo.membership.length, 0)
    t.deepEqual(userBar.membership.length, 0)
    t.deepEqual(ev.stringify(), 'S: '+d.toISOString()+'-0000 chatroom:leave {"chatId":"'+chatId+'","userId":"bar"}')

    ev = await rgine.replay(new Event(d = new Date(), 0, 'chatroom:send', { chatId, userId: 'bar', msg: 'yo'}, 'I', 'Chatroom> member "bar" cannot send message: not in'))
    t.deepEqual(chatroom, { members: [ ], messages: [ '* Chatroom created by foo', 'foo: test', '* Chatroom joined by bar', 'bar: yo', 'foo: bye', '* Chatroom left by foo', '* Chatroom left by bar' ] })
    t.deepEqual(userFoo.membership.length, 0)
    t.deepEqual(userBar.membership.length, 0)
    t.deepEqual(ev.stringify(), 'I: '+d.toISOString()+'-0000 chatroom:send {"chatId":"'+chatId+'","userId":"bar","msg":"yo"} Chatroom%3E%20member%20%22bar%22%20cannot%20send%20message%3A%20not%20in')

    ev = await rgine.replay(new Event(d = new Date(), 0, 'chatroom:leave', { chatId, userId: 'foo'}, 'I', 'Chatroom> member "foo" cannot leave: not in'))
    t.deepEqual(chatroom, { members: [ ], messages: [ '* Chatroom created by foo', 'foo: test', '* Chatroom joined by bar', 'bar: yo', 'foo: bye', '* Chatroom left by foo', '* Chatroom left by bar' ] })
    t.deepEqual(userFoo.membership.length, 0)
    t.deepEqual(userBar.membership.length, 0)
    t.deepEqual(ev.stringify(), 'I: '+d.toISOString()+'-0000 chatroom:leave {"chatId":"'+chatId+'","userId":"foo"} Chatroom%3E%20member%20%22foo%22%20cannot%20leave%3A%20not%20in')

  } catch(e) {
    t.fail(e.message +'\n'+ e.stack)
  } finally {
    t.plan(35)
    t.end()
  }
})
