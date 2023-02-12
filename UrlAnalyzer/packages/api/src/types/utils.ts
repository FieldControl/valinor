export type If<Generic, Condition, Then, Else = null> = Generic extends Condition ? Then : Else;

export type SqlUpdateRecord<T> = Partial<Record<keyof T, unknown>>;

export type SelectablePartial<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

type PreConfiguredFields = 'created_at' | 'id' | 'updated_at';

export type OmitBaseProps<T> = Omit<T, PreConfiguredFields>;
export type OmitBasePropsAndMore<T, K extends keyof Omit<T, PreConfiguredFields>> = Omit<T, K | PreConfiguredFields>;
