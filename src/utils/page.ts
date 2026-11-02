import { useEffect } from 'react';

export function usePageMeta(title: string, description?: string) {
  useEffect(() => {
    const previous = document.title;
    document.title = title;
    let meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    const previousDescription = meta?.content;
    if (description) {
      if (!meta) {
        meta = document.createElement('meta');
        meta.name = 'description';
        document.head.appendChild(meta);
      }
      meta.content = description;
    }
    return () => {
      document.title = previous;
      if (meta && previousDescription !== undefined) meta.content = previousDescription;
    };
  }, [title, description]);
}
