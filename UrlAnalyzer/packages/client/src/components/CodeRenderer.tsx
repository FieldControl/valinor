// @ts-expect-error: No types for highlight.js styles
import style from 'highlight.js/styles/atom-one-dark.css';

export function CodeRenderer({ data, ok }: { data: string; ok: boolean }): JSX.Element {
	console.log('CodeRenderer', data, ok);

	return ok ? (
		<div
			className={`bg-gray-900 break-all p-3 rounded word-wrap ${style}`}
			/* eslint-disable-next-line react/no-danger */
			dangerouslySetInnerHTML={{
				__html: data,
			}}
		/>
	) : (
		<div className="bg-gray-900 break-all p-3 rounded word-wrap">{data}</div>
	);
}
