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

/**
 *
 * This file is a model of Rule file format
 *
 */

exports = module.exports = []

exports.push({
  n: 'create_chatroom',
  o: function(param, store) {
    var userId = param.userId
      , userCallback = param.userCallback
      , chatId = store.newId()
    store.set(chatId, { members: [ userId ], messages: [ '* Chatroom created by '+userId ] })
    store.sub(chatId, userId, userCallback, true)
  }
},{
  n: 'join_chatroom',
  o: function(param, store) {
    var userId = param.userId
      , userCallback = param.userCallback
      , chatId = param.chatId
      , chatroom = store.get(chatId)
    chatroom.members.push(userId)
    chatroom.messages.push('* Chatroom joined by '+userId)
    store.sub(chatId, userId, userCallback)
    store.pub(chatId, 'update')
  }
},{
  n: 'leave_chatroom',
  o: function(param, store) {
    var userId = param.userId
      , chatId = param.chatId
      , chatroom = store.get(chatId)
    chatroom.members = chatroom.members.filter(function(u) { return u !== userId})
    chatroom.messages.push('* Chatroom left by '+userId)
    store.pub(chatId, 'update')
    store.unsub(chatId, userId)
  }
},{
  n: 'send_message',
  o: function(param, store) {
    var userId = param.userId
      , msg = param.msg
      , chatId = param.chatId
      , chatroom = store.get(chatId)
    chatroom.messages.push(userId + ': ' + msg)
    store.pub(chatId, 'update')
  }
})