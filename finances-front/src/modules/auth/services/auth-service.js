import apollo from '@plugins/apollo'
import LoginMutation from './../graphql/Login.gql'

const login = async (variables) => {
  const response = await apollo.mutate({
    mutation: LoginMutation,
    variables
  })
  return response.data.Login
}

export default {
  login
}
