import { useEffect, useState } from 'react';

const data = [
	'The Great Barrier Reef in Australia is the largest living structure on Earth, visible from space.',
	"The world's smallest mammal is the bumblebee bat, which weighs less than a penny.",
	'The longest recorded flight of a chicken was 13 seconds.',
	'The shortest war in recorded history lasted only 38 minutes between Britain and Zanzibar on 27 August 1896.',
	'The human nose can detect over 1 trillion different scents.',
	'The largest snowflake on record was 15 inches wide and 8 inches thick.',
	'The shortest river in the world is the Roe River in Montana, which is only 201 feet long.',
	'The largest pyramid in the world is not in Egypt, but in Mexico. The Great Pyramid of Cholula is a massive ancient structure covering an area of over an acre.',
	"The term 'butterfly' was originally used to describe a butter-colored fly, not all insects with iridescent wings.",
	"A group of flamingos is called a 'flamboyance.'",
	"A blue whale's heart is the size of a small car and can weigh up to 1,000 pounds.",
	'A single teaspoon of a neutron star would weigh about 6 billion tons.',
	'The longest recorded lifespan of a tortoise was 152 years.',
	'A group of hedgehogs is called a prickle.',
	"The world's largest snowflake was recorded in Fort Keogh, Montana in 1887 and measured 15 inches wide and 8 inches thick.",
	'A single tree can have over 160,000 insects and other invertebrates living in it.',
	'The longest word in the English language, according to the Oxford English Dictionary, is pneumonoultramicroscopicsilicovolcanoconiosis, a type of lung disease caused by inhaling very fine silica particles.',
	'The tallest building made entirely out of lego bricks is the Burj Khalifa in Dubai, standing at over 34 feet tall.',
	"The world's largest flower, the Rafflesia arnoldii, can grow up to 3 feet in diameter and weigh up to 15 pounds.",
	'The fastest land animal is the cheetah, which can reach speeds of up to 60 miles per hour.',
	"The world's oldest tree, a bristlecone pine, is estimated to be over 5,000 years old.",
	'A single teaspoon of a black hole would weigh around 6 billion tons.',
	'The longest river in the world is the Nile, which flows over 4,000 miles through 11 countries in Africa.',
	'A group of kangaroos is called a mob.',
	'The largest tornado on record was 2.5 miles wide and stayed on the ground for over 2 hours.',
	"The world's largest cave, Son Doong Cave in Vietnam, is over 5 miles long, has a jungle and river inside, and could fit a 40-story skyscraper.",
	'The tallest mountain in the solar system is Olympus Mons on Mars, standing at over 22 kilometers tall.',
	'The fastest bird is the peregrine falcon, which can dive at speeds of over 240 miles per hour.',
	'The largest living organism on Earth is a fungus called Armillaria ostoyae, which covers over 2,200 acres in Oregon.',
	'A single bolt of lightning can reach temperatures of up to 50,000 degrees Fahrenheit, hot enough to melt some metals.',
	"The world's largest ocean, the Pacific Ocean, covers over 60 million square miles.",
	"The world's largest volcano, Mauna Loa in Hawaii, is over 13,000 feet tall and covers over 2,035 square miles.",
	'A group of ravens is called a murder.',
	'The smallest country in the world by land area is the Vatican City, which covers only 0.17 square miles.',
	"The world's largest diamond, the Cullinan Diamond, weighed over 3,000 carats before it was cut into smaller diamonds.",
	'The longest bridge in the world is the Danyang-Kunshan Grand Bridge in China, which spans over 102 miles.',
	'The fastest fish in the world is the sailfish, which can swim at speeds of up to 68 miles per hour.',
	'A group of vultures is called a wake.',
	'The longest street in the world is Yonge Street in Canada, which stretches over 1,178 miles.',
	'The tallest building in the world is the Burj Khalifa in Dubai, standing at over 2,700 feet tall.',
	'The longest river in the United States is the Missouri River, which flows over 2,341 miles.',
	'A group of giraffes is called a tower.',
	'The largest desert in the world is the Antarctic Desert, covering over 5.5 million square miles.',
	'The largest waterfall in the world by volume is the Angel Falls in Venezuela, which drops over 3,000 feet.',
	'A group of hedgehogs is called a prickle.',
	'The longest cave system in the world is the Mammoth Cave System in Kentucky, which spans over 400 miles.',
	'The fastest land animal is the cheetah, which can reach speeds of up to 60 miles per hour.',
	'A group of otters is called a romp.',
	'The deepest point on Earth is the Mariana Trench, which reaches a depth of over 36,000 feet.',
	'The largest living organism on Earth is a fungus called Armillaria ostoyae, which covers over 2,200 acres in Oregon.',
];

export function RandomFacts() {
	// Change the fact every 10 seconds
	const [fact, setFact] = useState(data[Math.floor(Math.random() * data.length)]);

	useEffect(() => {
		const interval = setInterval(() => {
			setFact(data[Math.floor(Math.random() * data.length)]);
		}, 7_000);
		return () => clearInterval(interval);
	}, []);

	return <div className="text-center text-2xl font-bold text-gray-700 w-[400px] word-wrap">{fact}</div>;
}
