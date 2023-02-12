export function addTemporaryClass(element: HTMLElement, classNames: string[], duration: number) {
	element.classList.add(...classNames);
	setTimeout(() => {
		element.classList.remove(...classNames);
	}, duration);
}
