import Redis from 'ioredis'

describe('getbit', () => {
  it('should return 0 on keys that do not exist', () => {
    const redis = new Redis()

    return redis.getbit('foo', 0).then(result => {
      return expect(result).toBe(0)
    })
  })

  it('should throw if offset > 2^32', () => {
    const redis = new Redis()

    return redis.getbit('foo', 2 ** 32).then(
      () => {
        throw new Error('Expected getbit to fail')
      },
      err => {
        expect(err).toBeInstanceOf(Error)
        expect(err.message).toBe(
          'ERR bit offset is not an integer or out of range'
        )
      }
    )
  })

  it('should return bit value of key', () => {
    const redis = new Redis({
      data: {
        foo: 'bar',
      },
    })

    return redis.getbit('foo', 10).then(result => {
      return expect(result).toBe(1)
    })
  })

  it('should return 0 if offset is out of range', () => {
    const redis = new Redis({
      data: {
        foo: 'bar',
      },
    })

    return redis.getbit('foo', 2 ** 32 - 1).then(result => {
      return expect(result).toBe(0)
    })
  })
})