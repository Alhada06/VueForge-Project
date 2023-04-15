import { ApolloClient, createHttpLink, gql, InMemoryCache } from '@apollo/client/core'

const httpLink = createHttpLink({
  uri: 'https://uk.api.8base.com/cl5is6nae000009id2jvp0z3z'
})

const cache = new InMemoryCache()

export const apolloClient = new ApolloClient({
  link: httpLink,
  cache,
})
