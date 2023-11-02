import { NgModule } from '@angular/core';
import {
  FaIconLibrary,
  FontAwesomeModule,
} from '@fortawesome/angular-fontawesome';
import { faGithub, faLinkedin } from '@fortawesome/free-brands-svg-icons';
import {
  faCode,
  faExclamationCircle,
  faEye,
  faFaceFrown,
  faHeart,
  faMagnifyingGlass,
  faStar,
} from '@fortawesome/free-solid-svg-icons';

@NgModule({
  exports: [FontAwesomeModule],
})
export class IconsModule {
  constructor(library: FaIconLibrary) {
    library.addIcons(
      faMagnifyingGlass,
      faStar,
      faExclamationCircle,
      faEye,
      faCode,
      faHeart,
      faLinkedin,
      faGithub,
      faFaceFrown
    );
  }
}
