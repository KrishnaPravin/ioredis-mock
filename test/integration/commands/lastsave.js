import Redis from 'ioredis'

describe('lastsave', () => {
  it('should return unix time since last save', () => {
    const redis = new Redis()

    return redis.lastsave().then(result => {
      return expect(result).toBeLessThanOrEqual(
        Math.floor(new Date().getTime() / 1000)
      )
    })
  })
})