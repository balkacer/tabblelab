import Editor from '@monaco-editor/react'

interface SqlEditorProps {
    value: string
    onChange: (value: string) => void
}

export function SqlEditor({ value, onChange }: SqlEditorProps) {
    return (
        <Editor
            height="100%"
            defaultLanguage="sql"
            theme="vs-dark"
            value={value}
            onChange={(val) => onChange(val || '')}
            options={{
                fontSize: 14,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                automaticLayout: true,
                wordWrap: 'on',
            }}
        />
    )
}