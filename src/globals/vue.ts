import v from 'vue'

declare global {
    const Vue: typeof v
    type Vue = typeof v
}

extendGlobal({ Vue: v })