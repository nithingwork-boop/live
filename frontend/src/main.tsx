import React from 'react'
import ReactDOM from 'react-dom/client'
import { ChakraProvider, ColorModeScript, createLocalStorageManager, extendTheme } from '@chakra-ui/react'
import { ApolloClient, InMemoryCache, ApolloProvider, HttpLink } from '@apollo/client'
import App from './pages/App'

const COLOR_MODE_STORAGE_KEY = 'flow-color-mode'

const theme = extendTheme({
  config: {
    initialColorMode: 'dark',
    useSystemColorMode: false,
  },
})

const colorModeManager = createLocalStorageManager(COLOR_MODE_STORAGE_KEY)

// Apollo Client is configured but GraphQL is currently disabled
// When GraphQL is enabled, uncomment and use HttpLink
// const httpLink = new HttpLink({ uri: 'http://localhost:8081/graphql' });
// const client = new ApolloClient({ link: httpLink, cache: new InMemoryCache() });

// Same-origin in prod (nginx → Nest); split ports in local dev.
const graphqlUri =
  import.meta.env.VITE_GRAPHQL_URL ??
  (import.meta.env.DEV ? 'http://localhost:8081/graphql' : '/graphql');

// Temporary client for now (since GraphQL is disabled)
const client = new ApolloClient({ 
  link: new HttpLink({ uri: graphqlUri }),
  cache: new InMemoryCache(),
  defaultOptions: {
    query: {
      errorPolicy: 'all',
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ColorModeScript initialColorMode={theme.config.initialColorMode} storageKey={COLOR_MODE_STORAGE_KEY} />
    <ChakraProvider theme={theme} colorModeManager={colorModeManager}>
      <ApolloProvider client={client}>
        <App />
      </ApolloProvider>
    </ChakraProvider>
  </React.StrictMode>
)
