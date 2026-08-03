"use client";

import {
    useEffect,
    useState,
} from "react";

import {
    createClient,
} from "@/lib/supabase/client";

type BlogViewTrackerProps = {
    postId: string;
    initialViewCount: number;
};

const VIEWER_STORAGE_KEY =
    "forumfenomen_blog_viewer_key_v1";

function createViewerKey() {
    if (
        typeof crypto !== "undefined" &&
        typeof crypto.randomUUID ===
            "function"
    ) {
        return crypto.randomUUID();
    }

    return [
        Date.now().toString(36),
        Math.random()
            .toString(36)
            .slice(2),
        Math.random()
            .toString(36)
            .slice(2),
    ].join("-");
}

function getViewerKey() {
    try {
        const existingKey =
            window.localStorage.getItem(
                VIEWER_STORAGE_KEY
            );

        if (existingKey) {
            return existingKey;
        }

        const newKey =
            createViewerKey();

        window.localStorage.setItem(
            VIEWER_STORAGE_KEY,
            newKey
        );

        return newKey;
    } catch {
        return createViewerKey();
    }
}

export default function BlogViewTracker({
    postId,
    initialViewCount,
}: BlogViewTrackerProps) {
    const [supabase] = useState(
        () => createClient()
    );

    const [viewCount, setViewCount] =
        useState(initialViewCount);

    useEffect(() => {
        let active = true;

        async function registerView() {
            const viewerKey =
                getViewerKey();

            const {
                data,
                error,
            } = await supabase.rpc(
                "register_blog_post_view",
                {
                    target_post_id:
                        postId,
                    target_viewer_key:
                        viewerKey,
                }
            );

            if (
                !active ||
                error
            ) {
                return;
            }

            const nextCount =
                Number(data);

            if (
                Number.isFinite(
                    nextCount
                )
            ) {
                setViewCount(
                    nextCount
                );
            }
        }

        void registerView();

        return () => {
            active = false;
        };
    }, [postId, supabase]);

    return (
        <strong>
            {viewCount.toLocaleString(
                "tr-TR"
            )}
        </strong>
    );
}