import Redis from 'ioredis'

describe('brpoplpushBuffer', () => {
  it('should remove one item from the tail of the source list', () => {
    const redis = new Redis({
      data: {
        foo: ['foo', 'bar'],
      },
    })

    return redis.brpoplpushBuffer('foo', 'bar').then(() => {
      return expect(redis.data.get('foo')).toEqual(['foo'])
    })
  })

  it('should add one item to the head of the destination list', () => {
    const redis = new Redis({
      data: {
        foo: ['foo', 'bar'],
        bar: ['baz'],
      },
    })

    return redis.brpoplpushBuffer('foo', 'bar').then(() => {
      return expect(redis.data.get('bar')).toEqual(['bar', 'baz'])
    })
  })

  it('should return null if the source list does not exist', () => {
    const redis = new Redis({
      data: {},
    })

    return redis.brpoplpushBuffer('foo', 'bar').then(item => {
      return expect(item).toEqual(null)
    })
  })

  it('should return null if the source list is empty', () => {
    const redis = new Redis({
      data: {
        foo: [],
      },
    })

    return redis.brpoplpushBuffer('foo', 'bar').then(item => {
      return expect(item).toEqual(null)
    })
  })

  it('should return the item as buffer', () => {
    const redis = new Redis({
      data: {
        foo: ['foo', 'bar'],
      },
    })

    return redis.brpoplpushBuffer('foo', 'bar').then(item => {
      expect(Buffer.isBuffer(item)).toBeTruthy()
      expect(item).toEqual(Buffer.from('bar'))
    })
  })

  it('should return buffer values correctly', () => {
    const bufferVal = Buffer.from('bar')
    const redis = new Redis({
      data: {
        foo: ['foo', bufferVal],
      },
    })

    return redis.brpoplpushBuffer('foo', bufferVal).then(item => {
      return expect(item).toEqual(bufferVal)
    })
  })

  it('should throw an exception if the source key contains something other than a list', () => {
    const redis = new Redis({
      data: {
        foo: 'not a list',
        bar: [],
      },
    })

    return redis.brpoplpushBuffer('foo', 'bar').catch(err => {
      return expect(err.message).toBe('Key foo does not contain a list')
    })
  })

  it('should throw an exception if the destination key contains something other than a list', () => {
    const redis = new Redis({
      data: {
        foo: [],
        bar: 'not a list',
      },
    })

    return redis.brpoplpushBuffer('foo', 'bar').catch(err => {
      return expect(err.message).toBe('Key bar does not contain a list')
    })
  })
})