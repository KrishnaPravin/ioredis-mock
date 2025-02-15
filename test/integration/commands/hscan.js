import Chance from 'chance'
import Redis from 'ioredis'

const chance = new Chance()

describe('hscan', () => {
  const redis = new Redis()
  afterAll(() => {
    redis.disconnect()
  })

  function createHashSet(keys) {
    return keys.reduce((obj, key) => {
      const res = obj
      res[key] = chance.cc_type({ raw: true })
      return res
    }, {})
  }

  it('should return null array if hset does not exist', () => {
    return redis.hscan('key', 0).then(result => {
      expect(result[0]).toBe('0')
      expect(result[1]).toEqual([])
    })
  })

  // @TODO Rewrite test so it runs on a real Redis instance
  ;(process.env.IS_E2E ? it.skip : it)('should return keys in hset', () => {
    const redis = new Redis({
      data: {
        hset: createHashSet(['foo', 'bar', 'baz']),
      },
    })

    return redis.hscan('hset', 0).then(result => {
      expect(result[0]).toBe('0')
      expect(result[1]).toEqual(['foo', 'bar', 'baz'])
    })
  })

  // @TODO Rewrite test so it runs on a real Redis instance
  ;(process.env.IS_E2E ? it.skip : it)(
    'should return only mathced keys',
    () => {
      const redis = new Redis({
        data: {
          hset: createHashSet(['foo0', 'foo1', 'foo2', 'ZU0', 'ZU1']),
        },
      })

      return redis.hscan('hset', 0, 'MATCH', 'foo*').then(result => {
        expect(result[0]).toBe('0')
        expect(result[1]).toEqual(['foo0', 'foo1', 'foo2'])
      })
    }
  )

  // @TODO Rewrite test so it runs on a real Redis instance
  ;(process.env.IS_E2E ? it.skip : it)(
    'should return only mathced keys and limit by COUNT',
    () => {
      const redis = new Redis({
        data: {
          hset: createHashSet(['foo0', 'foo1', 'foo2', 'ZU0', 'ZU1']),
        },
      })

      return redis
        .hscan('hset', 0, 'MATCH', 'foo*', 'COUNT', 1)
        .then(result => {
          expect(result[0]).toBe('1') // more elements left, this is why cursor is not 0
          expect(result[1]).toEqual(['foo0'])
          return redis.hscan('hset', result[0], 'MATCH', 'foo*', 'COUNT', 10)
        })
        .then(result2 => {
          expect(result2[0]).toBe('0')
          expect(result2[1]).toEqual(['foo1', 'foo2'])
        })
    }
  )

  // @TODO Rewrite test so it runs on a real Redis instance
  ;(process.env.IS_E2E ? it.skip : it)(
    'should return number of keys hset by COUNT and continue by cursor',
    () => {
      const redis = new Redis({
        data: {
          hset: createHashSet(['foo0', 'foo1', 'bar0', 'bar1']),
        },
      })

      return redis
        .hscan('hset', 0, 'COUNT', 3)
        .then(result => {
          expect(result[0]).toBe('3')
          expect(result[1]).toEqual(['foo0', 'foo1', 'bar0'])
          return redis.hscan('hset', result[0], 'COUNT', 3)
        })
        .then(result2 => {
          expect(result2[0]).toBe('0')
          expect(result2[1]).toEqual(['bar1'])
        })
    }
  )

  it('should fail if incorrect cursor', () => {
    return redis.hscan('key', 'ZU').catch(result => {
      expect(result).toBeInstanceOf(Error)
    })
  })
  it('should fail if incorrect command', () => {
    return redis.hscan('key', 0, 'ZU').catch(result => {
      expect(result).toBeInstanceOf(Error)
    })
  })
  it('should fail if incorrect MATCH usage', () => {
    return redis.hscan('key', 0, 'MATCH', 'pattern', 'ZU').catch(result => {
      expect(result).toBeInstanceOf(Error)
    })
  })
  it('should fail if incorrect COUNT usage', () => {
    return redis.hscan('key', 0, 'COUNT', 10, 'ZU').catch(result => {
      expect(result).toBeInstanceOf(Error)
    })
  })
  it('should fail if incorrect COUNT usage 2', () => {
    return redis.hscan('key', 0, 'COUNT', 'ZU').catch(result => {
      expect(result).toBeInstanceOf(Error)
    })
  })
  it('should fail if too many arguments', () => {
    return redis
      .hscan('key', 0, 'MATCH', 'foo*', 'COUNT', 1, 'ZU')
      .catch(result => {
        expect(result).toBeInstanceOf(Error)
        expect(result.message).toEqual('Too many arguments')
      })
  })

  it('should fail if arguments length not odd', () => {
    return redis.hscan('key', 0, 'MATCH', 'foo*', 'COUNT').catch(result => {
      expect(result).toBeInstanceOf(Error)
      expect(result.message).toEqual(
        'Args should be provided by pair (name & value)'
      )
    })
  })
})
