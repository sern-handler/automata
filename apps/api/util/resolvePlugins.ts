import type { Request, Response } from "express"

export default function resolvePlugins(plugins: string[], req: Request, res: Response) {
    if (plugins.length === 0)
        // not doing any crazy types today sorry
        return [true]
    const resolvedPlugins: boolean[] = []
    plugins.forEach(async (plugin) => {
        const resolvedPlugin = await import(`../plugins/${plugin}.js`)
            .then((plugin) => plugin.default(req, res)) as boolean
        resolvedPlugins.push(resolvedPlugin)
    })
    return resolvedPlugins
}