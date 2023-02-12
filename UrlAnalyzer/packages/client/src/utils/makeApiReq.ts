export async function makeApiRequest<T>(path: string, options: RequestInit = {}) {
	const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1${path}`, {
		headers: {
			'Content-Type': 'application/json',
		},
		...options,
	});

	return res.json() as Promise<T>;
}
