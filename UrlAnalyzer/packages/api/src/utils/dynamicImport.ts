export function dynamicImport<
	T,
	R = () => Promise<{
		default: T;
	}>,
>(factory: () => Promise<any>): R {
	return factory as R;
}
