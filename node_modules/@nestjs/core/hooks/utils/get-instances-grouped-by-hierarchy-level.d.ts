import { InjectionToken } from '@nestjs/common';
import { InstanceWrapper } from '../../injector/instance-wrapper';
export declare function getInstancesGroupedByHierarchyLevel(...collections: Array<Map<InjectionToken, InstanceWrapper> | Array<[InjectionToken, InstanceWrapper]>>): Map<number, unknown[]>;
