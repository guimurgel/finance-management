const { env } = process

const isProduction = env.NODE_ENV === 'production'

const endpoint = `${env.PRISMA_ENDPOINT}/${env.PRISMA_SERVICE}/${env.PRISMA_STAGE}`
const secret = env.PRISMA_MANAGEMENT_API_SECRET
const playground = isProduction ? false : '/'

const corsHosts = env.CLIENT_HOSTS || ['localhost:8000', '127.0.0.1:8000'].join('|')
const corsProtocols = isProduction ? 'wss|https' : 'ws|http'
const origin = new RegExp(`(${corsProtocols}):\/\/(${corsHosts})(.+)?`)
//(wss|https):\/\/(localhost:8080|localhost:8081).(.+)?

module.exports = {
  endpoint,
  env,
  isProduction,
  origin,
  playground,
  secret
}