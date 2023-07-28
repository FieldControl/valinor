import { NgModule } from '@angular/core';
import { SharedModule } from '@shared/shared.module';

import { AuthModule } from './auth/auth.module';
import { SearchModule } from './search/search.module';

@NgModule({
  imports: [AuthModule, SearchModule, SharedModule],
  exports: [AuthModule, SearchModule],
  declarations: [],
})
export class ModulesModule {}
