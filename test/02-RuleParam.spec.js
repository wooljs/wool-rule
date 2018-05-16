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
