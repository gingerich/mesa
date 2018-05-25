import Local from './Local'

export const plugin = () => (mesa) => {

  mesa.use(Local.spec({ lookup: msg => mesa.getHandler(msg) }))

}

export default plugin

export { Local }
