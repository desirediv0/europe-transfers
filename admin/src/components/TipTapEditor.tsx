import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect } from "react";
import {
  Bold,
  Italic,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  RemoveFormatting,
} from "lucide-react";

interface TipTapEditorProps {
  value: string;
  onChange: (html: string) => void;
}

export function TipTapEditor({ value, onChange }: TipTapEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value,
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose max-w-none p-4 min-h-[220px] focus:outline-none bg-white font-sans text-gray-800 leading-relaxed",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  if (!editor) {
    return <div className="p-4 text-xs text-gray-400">Loading TipTap Editor...</div>;
  }

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm bg-white">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 bg-gray-50 border-b border-gray-200">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-1.5 rounded hover:bg-gray-200 text-gray-700 transition-colors ${
            editor.isActive("bold") ? "bg-gray-300 font-bold" : ""
          }`}
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-1.5 rounded hover:bg-gray-200 text-gray-700 transition-colors ${
            editor.isActive("italic") ? "bg-gray-300 font-bold" : ""
          }`}
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`p-1.5 rounded hover:bg-gray-200 text-gray-700 transition-colors ${
            editor.isActive("strike") ? "bg-gray-300 font-bold" : ""
          }`}
          title="Strikethrough"
        >
          <Strikethrough className="h-4 w-4" />
        </button>

        <div className="h-4 w-[1px] bg-gray-300 mx-1" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`p-1.5 rounded hover:bg-gray-200 text-gray-700 transition-colors ${
            editor.isActive("heading", { level: 1 }) ? "bg-gray-300 font-bold" : ""
          }`}
          title="Heading 1"
        >
          <Heading1 className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-1.5 rounded hover:bg-gray-200 text-gray-700 transition-colors ${
            editor.isActive("heading", { level: 2 }) ? "bg-gray-300 font-bold" : ""
          }`}
          title="Heading 2"
        >
          <Heading2 className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`p-1.5 rounded hover:bg-gray-200 text-gray-700 transition-colors ${
            editor.isActive("heading", { level: 3 }) ? "bg-gray-300 font-bold" : ""
          }`}
          title="Heading 3"
        >
          <Heading3 className="h-4 w-4" />
        </button>

        <div className="h-4 w-[1px] bg-gray-300 mx-1" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-1.5 rounded hover:bg-gray-200 text-gray-700 transition-colors ${
            editor.isActive("bulletList") ? "bg-gray-300 font-bold" : ""
          }`}
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-1.5 rounded hover:bg-gray-200 text-gray-700 transition-colors ${
            editor.isActive("orderedList") ? "bg-gray-300 font-bold" : ""
          }`}
          title="Ordered List"
        >
          <ListOrdered className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-1.5 rounded hover:bg-gray-200 text-gray-700 transition-colors ${
            editor.isActive("blockquote") ? "bg-gray-300 font-bold" : ""
          }`}
          title="Blockquote"
        >
          <Quote className="h-4 w-4" />
        </button>

        <div className="h-4 w-[1px] bg-gray-300 mx-1" />

        <button
          type="button"
          onClick={() => editor.chain().focus().unsetAllMarks().run()}
          className="p-1.5 rounded hover:bg-gray-200 text-gray-700 transition-colors"
          title="Clear Formatting"
        >
          <RemoveFormatting className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="p-1.5 rounded hover:bg-gray-200 text-gray-700 disabled:opacity-40 transition-colors"
          title="Undo"
        >
          <Undo className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="p-1.5 rounded hover:bg-gray-200 text-gray-700 disabled:opacity-40 transition-colors"
          title="Redo"
        >
          <Redo className="h-4 w-4" />
        </button>
      </div>

      {/* Content Area */}
      <EditorContent editor={editor} />
    </div>
  );
}
