'use strict'
/* eslint-env mocha */

const Facebook = require('..')

describe('facebook', () => {
  it('should be able to instantiate', () => {
    let fb = new Facebook()
    fb.should.be.instanceOf(Facebook)
  })
})
