"use client";

import {
    useRef,
    useState,
    type ChangeEvent,
} from "react";

import styles from "./page.module.css";

const emojis = [
    "😀",
    "😂",
    "😍",
    "🔥",
    "🚀",
    "✨",
    "💡",
    "📌",
    "✅",
    "❌",
    "⚠️",
    "🎯",
    "📈",
    "💰",
    "👏",
    "❤️",
];

export default function BlogContentEditor() {
    const textareaRef =
        useRef<HTMLTextAreaElement>(null);

    const [content, setContent] =
        useState("");

    const [showEmojis, setShowEmojis] =
        useState(false);

    function updateContent(
        nextValue: string,
        selectionStart: number,
        selectionEnd: number
    ) {
        setContent(nextValue);

        window.requestAnimationFrame(() => {
            const textarea =
                textareaRef.current;

            if (!textarea) {
                return;
            }

            textarea.focus();
            textarea.setSelectionRange(
                selectionStart,
                selectionEnd
            );
        });
    }

    function wrapSelection(
        before: string,
        after: string,
        placeholder: string
    ) {
        const textarea =
            textareaRef.current;

        if (!textarea) {
            return;
        }

        const start =
            textarea.selectionStart;

        const end =
            textarea.selectionEnd;

        const selected =
            content.slice(start, end);

        const insertedText =
            selected || placeholder;

        const nextValue =
            content.slice(0, start) +
            before +
            insertedText +
            after +
            content.slice(end);

        const selectionStart =
            start + before.length;

        const selectionEnd =
            selectionStart +
            insertedText.length;

        updateContent(
            nextValue,
            selectionStart,
            selectionEnd
        );
    }

    function prefixLines(
        prefix: string,
        placeholder: string
    ) {
        const textarea =
            textareaRef.current;

        if (!textarea) {
            return;
        }

        const start =
            textarea.selectionStart;

        const end =
            textarea.selectionEnd;

        const lineStart =
            content.lastIndexOf(
                "\n",
                Math.max(0, start - 1)
            ) + 1;

        const nextLineBreak =
            content.indexOf("\n", end);

        const lineEnd =
            nextLineBreak === -1
                ? content.length
                : nextLineBreak;

        const selectedBlock =
            content.slice(
                lineStart,
                lineEnd
            ) || placeholder;

        const transformed =
            selectedBlock
                .split("\n")
                .map((line) => {
                    if (!line.trim()) {
                        return line;
                    }

                    return `${prefix}${line}`;
                })
                .join("\n");

        const nextValue =
            content.slice(0, lineStart) +
            transformed +
            content.slice(lineEnd);

        updateContent(
            nextValue,
            lineStart,
            lineStart +
                transformed.length
        );
    }

    function createNumberedList() {
        const textarea =
            textareaRef.current;

        if (!textarea) {
            return;
        }

        const start =
            textarea.selectionStart;

        const end =
            textarea.selectionEnd;

        const lineStart =
            content.lastIndexOf(
                "\n",
                Math.max(0, start - 1)
            ) + 1;

        const nextLineBreak =
            content.indexOf("\n", end);

        const lineEnd =
            nextLineBreak === -1
                ? content.length
                : nextLineBreak;

        const selectedBlock =
            content.slice(
                lineStart,
                lineEnd
            ) || "Liste öğesi";

        const transformed =
            selectedBlock
                .split("\n")
                .map((line, index) => {
                    if (!line.trim()) {
                        return line;
                    }

                    return `${index + 1}. ${line}`;
                })
                .join("\n");

        const nextValue =
            content.slice(0, lineStart) +
            transformed +
            content.slice(lineEnd);

        updateContent(
            nextValue,
            lineStart,
            lineStart +
                transformed.length
        );
    }

    function insertLink() {
        const textarea =
            textareaRef.current;

        if (!textarea) {
            return;
        }

        const start =
            textarea.selectionStart;

        const end =
            textarea.selectionEnd;

        const selected =
            content.slice(start, end) ||
            "Bağlantı metni";

        const url =
            window.prompt(
                "Bağlantı adresini yaz:",
                "https://"
            );

        if (!url) {
            return;
        }

        const markdown =
            `[${selected}](${url.trim()})`;

        const nextValue =
            content.slice(0, start) +
            markdown +
            content.slice(end);

        updateContent(
            nextValue,
            start + markdown.length,
            start + markdown.length
        );
    }

    function insertEmoji(
        emoji: string
    ) {
        const textarea =
            textareaRef.current;

        if (!textarea) {
            return;
        }

        const start =
            textarea.selectionStart;

        const end =
            textarea.selectionEnd;

        const nextValue =
            content.slice(0, start) +
            emoji +
            content.slice(end);

        updateContent(
            nextValue,
            start + emoji.length,
            start + emoji.length
        );

        setShowEmojis(false);
    }

    function handleChange(
        event: ChangeEvent<HTMLTextAreaElement>
    ) {
        setContent(event.target.value);
    }

    return (
        <div className={styles.editor}>
            <div
                className={styles.editorToolbar}
                role="toolbar"
                aria-label="Yazı biçimlendirme araçları"
            >
                <button
                    type="button"
                    onClick={() =>
                        wrapSelection(
                            "**",
                            "**",
                            "Kalın metin"
                        )
                    }
                    title="Kalın"
                    aria-label="Kalın"
                >
                    <strong>B</strong>
                </button>

                <button
                    type="button"
                    onClick={() =>
                        wrapSelection(
                            "*",
                            "*",
                            "İtalik metin"
                        )
                    }
                    title="İtalik"
                    aria-label="İtalik"
                >
                    <em>I</em>
                </button>

                <span
                    className={
                        styles.toolbarDivider
                    }
                />

                <button
                    type="button"
                    onClick={() =>
                        prefixLines(
                            "## ",
                            "Ana başlık"
                        )
                    }
                    title="Ana başlık"
                >
                    H2
                </button>

                <button
                    type="button"
                    onClick={() =>
                        prefixLines(
                            "### ",
                            "Alt başlık"
                        )
                    }
                    title="Alt başlık"
                >
                    H3
                </button>

                <span
                    className={
                        styles.toolbarDivider
                    }
                />

                <button
                    type="button"
                    onClick={() =>
                        prefixLines(
                            "- ",
                            "Liste öğesi"
                        )
                    }
                    title="Madde listesi"
                    aria-label="Madde listesi"
                >
                    • Liste
                </button>

                <button
                    type="button"
                    onClick={
                        createNumberedList
                    }
                    title="Numaralı liste"
                    aria-label="Numaralı liste"
                >
                    1. Liste
                </button>

                <button
                    type="button"
                    onClick={() =>
                        prefixLines(
                            "> ",
                            "Önemli bilgi"
                        )
                    }
                    title="Bilgi kutusu"
                    aria-label="Bilgi kutusu"
                >
                    💡 Bilgi
                </button>

                <button
                    type="button"
                    onClick={insertLink}
                    title="Bağlantı ekle"
                    aria-label="Bağlantı ekle"
                >
                    🔗 Link
                </button>

                <div
                    className={
                        styles.emojiWrapper
                    }
                >
                    <button
                        type="button"
                        onClick={() =>
                            setShowEmojis(
                                (current) =>
                                    !current
                            )
                        }
                        title="Emoji ekle"
                        aria-label="Emoji ekle"
                        aria-expanded={
                            showEmojis
                        }
                    >
                        😊 Emoji
                    </button>

                    {showEmojis ? (
                        <div
                            className={
                                styles.emojiPicker
                            }
                        >
                            {emojis.map(
                                (emoji) => (
                                    <button
                                        key={
                                            emoji
                                        }
                                        type="button"
                                        onClick={() =>
                                            insertEmoji(
                                                emoji
                                            )
                                        }
                                    >
                                        {emoji}
                                    </button>
                                )
                            )}
                        </div>
                    ) : null}
                </div>
            </div>

            <textarea
                ref={textareaRef}
                name="content"
                value={content}
                onChange={handleChange}
                minLength={80}
                required
                rows={18}
                placeholder={`Giriş paragrafını yaz...

## Ana başlık

Kısa ve okunabilir paragraflar kullan.

> Önemli bilgileri bu biçimde bilgi kutusuna dönüştürebilirsin.

### Alt başlık

**Kalın**, *italik* ve emoji kullanabilirsin. 🚀`}
            />
        </div>
    );
}