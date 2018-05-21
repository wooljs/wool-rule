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

// TODO ValidID, Crypto asymetric 

test('RuleParam toDTO', async function(t) {
  let check = new RuleParam([
    RuleParam.NUM('numkey'),
    RuleParam.STR('strkey')
  ])
  t.deepEqual(check.toDTO(), {numkey: true, strkey: true})
  t.plan(1)
  t.end()
})

test('rule-param BOOL', async function(t) {
  let check = RuleParam.BOOL('key')
    , store = new Store()

  t.ok(await check.validate(store, { key: true }))
  t.ok(await check.validate(store, { key: false }))
  t.notOk(await check.validate(store, { key: 'foo' }))
  t.notOk(await check.validate(store, { foo: true }))
  t.plan(4)
  t.end()
})

test('rule-param NUM', async function(t) {
  let check = RuleParam.NUM('key')
    , store = new Store()

  t.ok(await check.validate(store, { key: 42 }))
  t.notOk(await check.validate(store, { key: 'foo' }))
  t.notOk(await check.validate(store, { foo: 42 }))
  t.plan(3)
  t.end()
})

test('rule-param STR', async function(t) {
  let check = RuleParam.STR('key')
    , store = new Store()

  t.ok(await check.validate(store, { key: 'foo' }))
  t.notOk(await check.validate(store, { key: 42 }))
  t.notOk(await check.validate(store, { foo: 'bar' }))
  t.plan(3)
  t.end()
})

test('rule-param STR.asDate', async function(t) {
  let check = RuleParam.STR('key').asDate()
    , store = new Store()
    , p

  t.ok(await check.validate(store, p = { key: '2018-05-19' }))
  t.deepEqual(p, { key: new Date(1526688000000)})

  t.ok(await check.validate(store, p = { key: '2018-05-19T06:04:29' }))
  t.deepEqual(p, { key: new Date(1526709869000)})

  t.ok(await check.validate(store, p = { key: '2018-05-19T06:04:29.945Z' }))
  t.deepEqual(p, { key: new Date(1526709869945)})

  t.notOk(await check.validate(store, { key: 1526688000000 })) // we check it is a string so this is invalid
  t.notOk(await check.validate(store, { key: '1526709869945' }))
  t.notOk(await check.validate(store, { key: 'plop' }))

  t.plan(9)
  t.end()
})

test('rule-param STR.regex', async function(t) {
  let check = RuleParam.STR('key').regex(/^f/)
    , store = new Store()

  t.ok(await check.validate(store, { key: 'foo' }))
  t.notOk(await check.validate(store, { key: 'bar' }))
  t.notOk(await check.validate(store, { key: 'another' }))
  t.notOk(await check.validate(store, { key: 42 }))
  t.notOk(await check.validate(store, { foo: 'bar' }))
  t.plan(5)
  t.end()
})

test('rule-param STR.regex.crypto', async function(t) {
  let check = RuleParam.STR('key').regex(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z0-9]{8,}$/).crypto(x => x)
    , store = new Store()

  t.ok(await check.validate(store, { key: 'FooBar42' }))
  t.ok(await check.validate(store, { key: 'xD5Ae8f4ysFG9luB' }))
  t.notOk(await check.validate(store, { key: 'bar' }))
  t.notOk(await check.validate(store, { key: 'another' }))
  t.notOk(await check.validate(store, { key: 42 }))
  t.notOk(await check.validate(store, { foo: 'bar' }))
  t.plan(6)
  t.end()
})

test('rule-param STR.regex.crypto.check', async function(t) {
  let check = RuleParam.STR('key')
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

  t.ok(await check.validate(store, { userId: 'foo', key: 'FooBar42' }))
  t.ok(await check.validate(store, { userId: 'bar', key: 'xD5Ae8f4ysFG9luB' }))
  t.notOk(await check.validate(store, { userId: 'foo' }))
  t.notOk(await check.validate(store, { userId: 'bar' }))
  t.notOk(await check.validate(store, { userId: 'foo', key: 42 }))
  t.notOk(await check.validate(store, { userId: 'bar', key: 'another' }))
  t.notOk(await check.validate(store, { key: 'another' }))
  t.notOk(await check.validate(store, { key: 42 }))
  t.notOk(await check.validate(store, { foo: 'bar' }))
  t.plan(9)
  t.end()
})

test('rule-param ENUM', async function(t) {
  let check = RuleParam.ENUM('key', [ 'foo', 'bar', 'another' ])
    , store = new Store()

  t.ok(await check.validate(store, { key: 'foo' }))
  t.ok(await check.validate(store, { key: 'another' }))
  t.notOk(await check.validate(store, { key: 42 }))
  t.notOk(await check.validate(store, { foo: 'bar' }))
  t.plan(4)
  t.end()
})

test('rule-param STRUCT', async function(t) {
  let check = RuleParam.STRUCT('key', [ RuleParam.NUM('int'), RuleParam.STR('str'), RuleParam.ENUM('rank', [ 'S', 'A', 'B' ]) ])
    , store = new Store()

  t.ok(await check.validate(store, { key: { int: 42, str: 'plop', rank: 'S'} }))
  t.ok(await check.validate(store, { key: { int: 666, str: 'foobar', rank: 'B'} }))
  t.notOk(await check.validate(store, { key: { int: 42, str: 'plop', rank: 'K'} }))
  t.notOk(await check.validate(store, { key: { int: 42, str: 666, rank: 'S'} }))
  t.notOk(await check.validate(store, { key: { int: 'yo', str: 'plop', rank: 'S'} }))
  t.notOk(await check.validate(store, { key: { str: 'plop', rank: 'S'} }))
  t.notOk(await check.validate(store, { key: 42 }))
  t.notOk(await check.validate(store, { key: true }))
  t.notOk(await check.validate(store, { foo: 'bar' }))
  t.plan(9)
  t.end()
})

test('rule-param LIST', async function(t) {
  let check = RuleParam.LIST(RuleParam.STR('key'))
    , store = new Store()

  t.ok(await check.validate(store, { key: [ 'foo' ] }))
  t.ok(await check.validate(store, { key: [ 'foo', 'bar' ] }))
  t.ok(await check.validate(store, { key: [ 'another', 'foo', 'bar' ] }))
  t.ok(await check.validate(store, { key: [ ] }))
  t.notOk(await check.validate(store, { key: [ 42 ] }))
  t.notOk(await check.validate(store, { key: [ 42, 666 ] }))
  t.notOk(await check.validate(store, { key: [ 42, 'plop' ] }))
  t.notOk(await check.validate(store, { key: { int: 42, str: 666, rank: 'S'} }))
  t.notOk(await check.validate(store, { key: 42 }))
  t.notOk(await check.validate(store, { key: true }))
  t.notOk(await check.validate(store, { foo: 'bar' }))
  t.plan(11)
  t.end()
})
