enum CardPriority {
  Low = "LOW",
  Medium = "MEDIUM",
  High = "HIGH",
}

export type Cards = {
	id: string;
	position: number;
	title: string;
	priority: CardPriority;
};

export type Columns = {
	id: string;
	position: number;
	title: string;
	cards: Cards[];
};
