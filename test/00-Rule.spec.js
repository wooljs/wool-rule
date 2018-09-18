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

var test = require('tape-async')
  , Rule = require(__dirname + '/../lib/Rule.js')
  , { ParamCheck } = require('wool-validate')

test('create one rule', async function(t) {
  let s = {}
    , n = Date.now()
    , p = {}
    , rule = Rule.build({
      namespace: 'test',
      name: 'rule',
      param: [],
      cond(store, tmstp, param) {
        return new Promise(resolve => {
          setTimeout(() => {
            t.deepEqual(s, store)
            t.deepEqual(n, tmstp)
            t.deepEqual(p, param)
            resolve(true)
          }, 100)
        })
      },
      run() {}
    })
    , actual = await rule.validate(s, n, p)
  t.ok(actual)
  t.plan(4)
  t.end()
})

test('create one ruleSet', function(t) {
  let fun_test = function() {}
    , rules = Rule.buildSet('test', { name: 'rule01', run() {} }, { name: 'rule02', run: fun_test }, { name: 'rule03', run() {} })

  t.ok(rules.length === 3)
  t.ok(rules[1].run === fun_test)

  t.plan(2)
  t.end()
})

test('filter params', function(t) {
  let rule = Rule.build({
    namespace: 'test',
    name: 'rule',
    param: [ new ParamCheck('foo'), new ParamCheck('fizbuz'), new ParamCheck('bar').drop() ],
    run() {}
  })

  t.deepEqual(rule.filterParam({}), {})
  t.deepEqual(rule.filterParam({foo: 1}), {foo:1})
  t.deepEqual(rule.filterParam({foo: 1, fizbuz: 'toto' }), {foo:1, fizbuz: 'toto' })
  t.deepEqual(rule.filterParam({foo: 1, fizbuz: 'toto', bar: 'bye' }), {foo:1, fizbuz: 'toto' })
  t.deepEqual(rule.filterParam({foo: 1, fizbuz: 'toto', bar: 'bye', bim:'unexpected' }), {foo:1, fizbuz: 'toto'})
  t.plan(5)
  t.end()
})
