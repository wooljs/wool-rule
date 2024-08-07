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

import test from 'tape'
import { Rule } from '../index.js'
import { ParamCheck } from 'wool-validate'

test('create one rule', async function (t) {
  const s = {}
  const n = Date.now()
  const p = {}
  const rule = Rule.build({
    namespace: 'test',
    name: 'rule',
    param: [],
    cond (store, tmstp, param) {
      return new Promise(resolve => {
        setTimeout(() => {
          t.deepEqual(s, store)
          t.deepEqual(n, tmstp)
          t.deepEqual(p, param)
          resolve(undefined)
        }, 100)
      })
    },
    run () { }
  })
  t.ok(typeof await rule.validate(s, n, p) === 'undefined')
  t.deepEqual(rule.toDTO(), { n: 'test:rule', p: {} })
  t.plan(5)
  t.end()
})

test('create one ruleSet', function (t) {
  const funTest = function () { }
  const rules = Rule.buildSet('test', { name: 'rule01', run () { } }, { name: 'rule02', run: funTest }, { name: 'rule03', run () { } })

  t.ok(rules.length === 3)
  t.ok(rules[1].run === funTest)

  t.plan(2)
  t.end()
})

test('create bad rule', function (t) {
  t.throws(() => Rule.build({}), /^Error: field "namespace" is.*/)
  t.throws(() => Rule.build({ namespace: 'test' }), /^Error: field "name" is.*/)
  t.throws(() => Rule.build({ namespace: 'test', name: 'plop' }), /^Error: field "run" is.*/)
  t.throws(() => Rule.build({
    namespace: null,
    name: undefined,
    param: [],
    cond () { },
    run () { }
  }), /^Error: field "namespace" must be a string.*/)
  t.throws(() => Rule.build({
    namespace: 'test',
    name: undefined,
    param: [],
    cond () { },
    run () { }
  }), /^Error: field "name" must be a string.*/)
  t.throws(() => Rule.build({
    namespace: 'test',
    name: 'rule',
    param: {},
    cond () { },
    run () { },
    replay () { }
  }), /^Error: field "param" must be an array.*/, '')
  t.throws(() => Rule.build({
    namespace: 'test',
    name: 'rule',
    param: [],
    cond: null,
    run () { }
  }), /^Error: field "cond" must be a function.*/, '')
  t.throws(() => Rule.build({
    namespace: 'test',
    name: 'rule',
    param: [],
    cond () { },
    run: 'plop'
  }), /^Error: field "run" must be a function.*/, '')
  t.throws(() => Rule.build({
    namespace: 'test',
    name: 'rule',
    param: [],
    cond () { },
    run () { },
    replay: 'plop'
  }), /^Error: field "replay" must be a function.*/, '')

  t.throws(() => Rule.buildSet(/muhahaha/, []),
    /^Error: constructor parameter "namespace" must be a string./, '')

  t.plan(10)
  t.end()
})

test('filter params', function (t) {
  const rule = Rule.build({
    namespace: 'test',
    name: 'rule',
    param: [new ParamCheck('foo'), new ParamCheck('fizbuz'), new ParamCheck('bar').drop()],
    run () { }
  })

  t.deepEqual(rule.filterParam({}), {})
  t.deepEqual(rule.filterParam({ foo: 1 }), { foo: 1 })
  t.deepEqual(rule.filterParam({ foo: 1, fizbuz: 'toto' }), { foo: 1, fizbuz: 'toto' })
  t.deepEqual(rule.filterParam({ foo: 1, fizbuz: 'toto', bar: 'bye' }), { foo: 1, fizbuz: 'toto' })
  t.deepEqual(rule.filterParam({ foo: 1, fizbuz: 'toto', bar: 'bye', bim: 'unexpected' }), { foo: 1, fizbuz: 'toto' })
  t.plan(5)
  t.end()
})
