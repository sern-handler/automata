export default [
    {
        name: 'Update docs',
        method: 'POST',
        route: '/wh/updateDocs',
        plugins: [],
        cmdArgs: {
            githubToken: process.env.GHTOKEN!,
            email: process.env.EMAIL!
        },
        stepsMainDir: 'updateDocs',
        steps: [
            {
                id: 1,
                name: 'Move docusaurus config files',
                cwd: 'repos/website',
                script: 'moveFiles.sh'
            },
            {
                id: 2,
                name: 'Build docs',
                cwd: 'repos/website',
                script: 'buildWebsite.sh'
            },
            {
                id: 3,
                name: 'Revert moved config files',
                cwd: 'repos/website',
                script: 'revertMovedFiles.sh'
            },
            {
                id: 4,
                name: 'Generate Typedoc JSON',
                cwd: 'repos/website',
                script: 'typedocJson.sh'
            },
            {
                id: 5,
                name: 'Push website',
                cwd: 'repos/website',
                script: 'pushWebsite.sh'
            },
            {
                id: 6,
                name: 'Push community bot',
                cwd: 'repos/sern-community',
                script: 'pushCommunityBot.sh'
            }
        ]
    },
    {
        name: 'Test',
        method: 'GET',
        route: '/test',
        plugins: ['apiToken'],
        cmdArgs: {
            randomVariable: 'hey this is a variable'
        },
        stepsMainDir: 'test',
        steps: [
            {
                id: 1,
                name: 'Hello world',
                cwd: 'scripts/test',
                script: 'test.sh'
            },
            {
                id: 2,
                name: 'Hello world from variable',
                cwd: 'scripts/test',
                script: 'variable.sh'
            }
        ]
    }
] satisfies Jobs[]

export interface Jobs {
    name: string;
    method: 'GET' | 'POST';
    route: string;
    plugins: string[];
    cmdArgs: Record<string, string>;
    stepsMainDir: string;
    steps: Step[];
}

export interface Step {
    id: number;
    name: string;
    cwd: string;
    script: string
}

export interface Logs {
    timestamp: Date;
    message: string;
    level: 'info' | 'error';
}

export interface LogGroup {
    stepId: string;
    logs: Logs[];
}
