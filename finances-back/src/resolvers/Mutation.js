const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const moment = require('moment')
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

//CREATE RECORD
function createRecord (_, args, ctx, info) {

  //Validacao data
  const date = moment(args.date)
  if (!date.isValid()){
    throw new Error('Invalid date!')
  }

  //Verifica o valor e add o sinal correto
  let { amount, type } = args
  if (
    (type === 'DEBIT' && amount > 0) ||
    (type === 'CREDIT' && amount < 0)
  ) {
    amount = -amount
  }

  //Recuera usuario
  const userId = getUserId(ctx)
  
  return ctx.db.mutation.createRecord({
    data: {
      user: {
        connect: { id: userId }
      },
      account: {
        connect: { id: args.accountId }
      },
      category: {
        connect: { id: args.categoryId }
      },
      amount: amount,
      type: args.type,
      date: args.date,
      description: args.description,
      tags: args.tags,
      note: args.note
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
  createRecord,
  login,
  signup
}