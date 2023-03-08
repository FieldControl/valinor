import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  cardList = [
    {
      title: 'Mordor',
      link: '../../assets/mordor.jpg',
      description:'Mordor is a region located in the southeastern part of Middle-earth, considered the realm of Sauron the Dark Lord, east of Gondor, Ithilian and the Great River Anduin.'
    },
    {
      title: 'Rohan',
      link: '../../assets/rohan.jpg',
      description:'Rohan was a kingdom of men, located in the land formerly known as Calenardhon, situated in the great valley between the Misty Mountains and the White Mountains to the south.'
    },
    {
      title: 'GONDOR',
      link: '../../assets/gondor.jpeg',
      description:'Gondor is the mightiest realm of Men in Middle-earth. The kingdom of Rohan borders on the north, on the west is the Great Sea, on the south is Harad and on the east is Mordor.'
    },
    {
      title: 'RHOVANION',
      link: '../../assets/rhovanion.jpg',
      description:'Rhovanion, was the name of a small region east of the Greenwood, which later became the Kingdom of Rhovanion, but the name was used for the entire region in the Third Age.'
    },
        {
      title: 'ERIADOR',
      link: '../../assets/eriador.jpg',
      description:'Land between the Misty Mountains and the Blue Mountains, in which the realm of Arnor (and also the Shire of Hobbits) was located.'
    },
        {
      title: 'ARNOR',
      link: '../../assets/arnor.jpg',
      description:'Arnor was the northern Kingdom of the Dúnedain in Middle-earth. Originally Arnor was united with Gondor in the south, however, as time passed, the two realms became separated and isolated.'
    },
        {
      title: 'RHÛN',
      link: '../../assets/rhun.jpg',
      description:'Rhun was the name of the unknown in the lands of the Far Middle-Eastern land. A race of Men called the Easterlings lived in Rhun'
    }
  ]
}
