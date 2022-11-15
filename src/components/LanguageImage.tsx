import Image from "next/image";
import { XCircle } from "phosphor-react";

interface LanguageImageProps {
    language: string;
}

export default function LanguageImage({language}:LanguageImageProps) {

    if(language == "C#") {
        language = "csharp";
    } else if(language == "C++") {
        language = "cplusplus";
    } else if(language == "CSS") {
        language = "css3";
    } else if(language == "HTML") {
        language = "html5";
    } else if(language == "Jupyter Notebook") {
        language = "jupyter";
    }

    language = language.toLowerCase();

    const src = `https://raw.githubusercontent.com/devicons/devicon/master/icons/${language}/${language}-original.svg`;

    return (
            <Image
            loader={() => src}
            src={src}
            onError={({ currentTarget }) => {
                currentTarget.onerror = null; // prevents looping
                currentTarget.src= 'https://cdn.discordapp.com/emojis/1041783488686338068.png';
            }}
            alt= ''
            width={20} 
            height={20} 
            unoptimized={true}
            />
        )
}   
        