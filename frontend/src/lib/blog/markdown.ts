import { marked } from 'marked';

marked.setOptions({
	gfm: true,
	breaks: true
});

export function renderMarkdown(content: string): string {
	const html = marked.parse(content, { async: false }) as string;
	return html.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '');
}
