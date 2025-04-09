import { Module } from '@nestjs/common';
import { Service } from './.service';
import { Controller } from './.controller';

@Module({
  controllers: [Controller],
  providers: [Service],
})
export class Module {}
