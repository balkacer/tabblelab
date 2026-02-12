import Editor, { OnMount } from '@monaco-editor/react'

interface SqlEditorProps {
    value: string
    onChange: (value: string) => void
    onRun: () => void
}

export function SqlEditor({ value, onChange, onRun }: SqlEditorProps) {
    const handleMount: OnMount = (editor, monaco) => {
        editor.addCommand(
            monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter,
            () => {
                onRun()
            }
        )
    }

    return (
        <Editor
            height="100%"
            defaultLanguage="sql"
            theme="vs-dark"
            value={value}
            onChange={(val) => onChange(val || '')}
            onMount={handleMount}
            options={{
                fontSize: 14,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                automaticLayout: true,
                wordWrap: 'on',
                padding: { top: 12 },
            }}
        />
    )
}