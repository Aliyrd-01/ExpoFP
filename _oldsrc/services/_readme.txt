services here are singletons
they do not have their internal state (at least that affects externals)
but can have internal state when needed
they listen to state changes via subscribe 
they listen to store actions via listen
they dispatch events
they can auto-start themselves
they may have API accessible to containers/other services or event components