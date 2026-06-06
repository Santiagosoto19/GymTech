import { Membership } from '../entities/Membership';

export interface IMembershipPlanRepository {
  findAll(): Promise<Membership[]>;
  findById(id: string): Promise<Membership | null>;
  save(plan: Membership): Promise<Membership>;
}
