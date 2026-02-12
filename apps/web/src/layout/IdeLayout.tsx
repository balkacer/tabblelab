import { ReactNode } from 'react'

interface IdeLayoutProps {
    sidebar: ReactNode
    editor: ReactNode
    results: ReactNode
}

export function IdeLayout({
    sidebar,
    editor,
    results,
}: IdeLayoutProps) {
    return (
        <div className="h-screen flex bg-neutral-950 text-white overflow-hidden">
            {/* Sidebar */}
            <div className="w-60 border-r border-neutral-800 bg-neutral-900 overflow-auto">
                {sidebar}
            </div>

            {/* Main */}
            <div className="flex-1 flex flex-col overflow-hidden min-h-0">
                {/* Editor */}
                <div className="flex-[0_0_45%] min-h-0 flex flex-col border-b border-neutral-800 overflow-hidden bg-neutral-950">
                    {editor}
                </div>

                {/* Results */}
                <div className="flex-1 overflow-auto">
                    {results}
                </div>
            </div>
        </div>
    )
}