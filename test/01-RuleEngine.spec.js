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
  , Rule = require(__dirname + '/../lib/Rule.js')
  , RuleParam = require(__dirname + '/../lib/RuleParam.js')
  , RuleEngine = require(__dirname + '/../lib/RuleEngine.js')
  , Store = require('wool-store').Store
  , Command = require('wool-model').Command

test('initiate rule-engine', async function(t) {
  let store = new Store()
    , rgine = new RuleEngine(store)
    , chatId = null

  store.subAll('init', k => { if (chatId === null) { chatId = k } })

  rgine.addRules(Rule.buildSet('chatroom', {
    name: 'create',
    param: {
      userId: RuleParam.ID
    },
    async run(store, t, param) {
      let k = Store.newId()
        , { userId } = param
      await store.set(k, { members: [ userId ], messages: [ '* Chatroom created by '+userId ] })
    }
  },{
    name: 'join',
    param: {
      userId: RuleParam.ID
    },
    async run(store, t, param) {
      let {chatId, userId} = param
        , chatroom = await store.get(chatId)
      chatroom.members.push(userId)
      chatroom.messages.push('* Chatroom joined by '+userId)
      await store.set(chatId, chatroom)
    }
  }))

  await rgine.execute(new Command(Date.now(), 'chatroom:create', {userId: 'foo'}))
  //console.log(chatId)
  await rgine.execute(new Command(Date.now(), 'chatroom:join', {chatId, userId: 'bar'}))

  let chatroom = await store.get(chatId)

  t.equals(chatroom, {})
  //t.plan(4)
  t.end()
})
