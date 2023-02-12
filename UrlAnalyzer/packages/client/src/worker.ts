import { findFormatter } from './utils/formatBody';

export type WorkerMessageTypes = 'formatBody';

export interface WorkerBody {
	formatBody: {
		data: string;
		resource_type: string;
	};
}

export interface BaseWorkerMessage<T extends WorkerMessageTypes> {
	data: WorkerBody[T];
	nonce: string;
	type: T;
}

addEventListener('message', (event: MessageEvent<BaseWorkerMessage<any>>) => {
	const { data } = event;
	const { type, data: messageData } = data as BaseWorkerMessage<WorkerMessageTypes>;

	switch (type) {
		case 'formatBody':
			postMessage({
				nonce: data.nonce,
				data: findFormatter(messageData.data, messageData.resource_type),
			});
			break;
		default:
			break;
	}
});
