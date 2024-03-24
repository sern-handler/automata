import type { Request, Response } from "express"

export default async function resolvePlugins(plugins: string[], req: Request, res: Response) {
    if (plugins.length === 0)
        // not doing any crazy stuff today sorry
        return [true]
    const resolvedPlugins: boolean[] = []
    plugins.forEach(async (plugin) => {
        const resolvedPlugin = await import(`../plugins/${plugin}.js`)
            .then(async (plugin) => await plugin.default(req, res) as boolean)
            .catch(() => {
                console.error(`Plugin ${plugin} doesn't exist`)
                return false
            })
        resolvedPlugins.push(resolvedPlugin)
    })
    return resolvedPlugins
}