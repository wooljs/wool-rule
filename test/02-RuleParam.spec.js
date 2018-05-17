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

const test = require('tape')
  , RuleParam = require(__dirname + '/../lib/RuleParam.js')
  , { Store } = require('wool-store')

test('rule-param STR', async function(t) {
  let check = RuleParam.STR('str')
    , store = new Store()

  t.ok(await check.validate(store, { str: 'foo' }))
  t.notOk(await check.validate(store, { str: 42 }))
  t.notOk(await check.validate(store, { foo: 'bar' }))
  t.plan(3)
  t.end()
})

test('rule-param STR.regex', async function(t) {
  let check = RuleParam.STR('str').regex(/^f/)
    , store = new Store()

  t.ok(await check.validate(store, { str: 'foo' }))
  t.notOk(await check.validate(store, { str: 'bar' }))
  t.notOk(await check.validate(store, { str: 'another' }))
  t.notOk(await check.validate(store, { str: 42 }))
  t.notOk(await check.validate(store, { foo: 'bar' }))
  t.plan(5)
  t.end()
})

test('rule-param STR.regex.crypto', async function(t) {
  let check = RuleParam.STR('str').regex(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z0-9]{8,}$/).crypto(x => x)
    , store = new Store()

  t.ok(await check.validate(store, { str: 'FooBar42' }))
  t.ok(await check.validate(store, { str: 'xD5Ae8f4ysFG9luB' }))
  t.notOk(await check.validate(store, { str: 'bar' }))
  t.notOk(await check.validate(store, { str: 'another' }))
  t.notOk(await check.validate(store, { str: 42 }))
  t.notOk(await check.validate(store, { foo: 'bar' }))
  t.plan(6)
  t.end()
})

test('rule-param STR.regex.crypto.check', async function(t) {
  let check = RuleParam.STR('str')
    .regex(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z0-9]{8,}$/)
    .crypto(x => x)
    .check(async (store, param) => {
      let { userId } = param
        , user = await store.get(userId)
      if (user) return user.password
    })
    , store = new Store()

  store.set('foo', { password: 'FooBar42' })
  store.set('bar', { password: 'xD5Ae8f4ysFG9luB' })

  t.ok(await check.validate(store, { userId: 'foo', str: 'FooBar42' }))
  t.ok(await check.validate(store, { userId: 'bar', str: 'xD5Ae8f4ysFG9luB' }))
  t.notOk(await check.validate(store, { userId: 'foo' }))
  t.notOk(await check.validate(store, { userId: 'bar' }))
  t.notOk(await check.validate(store, { userId: 'foo', str: 42 }))
  t.notOk(await check.validate(store, { userId: 'bar', str: 'another' }))
  t.notOk(await check.validate(store, { str: 'another' }))
  t.notOk(await check.validate(store, { str: 42 }))
  t.notOk(await check.validate(store, { foo: 'bar' }))
  t.plan(9)
  t.end()
})

test('rule-param ENUM', async function(t) {
  let check = RuleParam.ENUM('str', [ 'foo', 'bar', 'another' ])
    , store = new Store()

  t.ok(await check.validate(store, { str: 'foo' }))
  t.ok(await check.validate(store, { str: 'another' }))
  t.notOk(await check.validate(store, { str: 42 }))
  t.notOk(await check.validate(store, { foo: 'bar' }))
  t.plan(4)
  t.end()
})
