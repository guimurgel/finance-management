const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { getUserId } = require('./../utils')

const JWT_SECRET = process.env.JWT_SECRET


//CREATE ACC
function createAccount (_, { description }, ctx, info) {

  //Recuera usuario
  const userId = getUserId(ctx)
  return ctx.db.mutation.createAccount({
    data: {
      description,
      user: {
        connect: {
          id: userId
        }
      }
    }
  }, info)

}

//CREATE CATEGORY
function createCategory (_, { description, operation }, ctx, info) {

  //Recuera usuario
  const userId = getUserId(ctx)

  return ctx.db.mutation.createCategory({
    data: {
      description,
      operation,
      user: {
        connect: {
          id: userId
        }
      }
    }
  }, info)

}

//LOGIN
async function login(_, { email, password }, ctx, info) {

  const user = await ctx.db.query.user( {where: { email} })

  //Verifica se tem usuario
  if (!user) {
    throw new Error('Invalid credentials!')
  }

  //Verifica se usuario valido
  const valid = await bcrypt.compare(password, user.password)
  if (!valid) {
    throw new Error('Invalid credentials!')
  }

  //Gerar Token
  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '2h' })

  //Return AuthPayload
  return {
    token,
    user
  }

}

//SIGNUP
async function signup (_, args, ctx, info) {

  const password = await bcrypt.hash(args.password, 10)
  const user = await ctx.db.mutation.createUser({ data: {...args, password} })
  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '2h' })

  //Return AuthPayload
  return {
    token,
    user
  }

}

module.exports = {
  createAccount,
  createCategory,
  login,
  signup
}