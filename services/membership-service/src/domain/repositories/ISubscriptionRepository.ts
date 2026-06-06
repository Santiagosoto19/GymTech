import { Subscription } from '../entities/Subscription';

export interface ISubscriptionRepository {
  findAll(): Promise<Subscription[]>;
  findById(id: string): Promise<Subscription | null>;
  findActiveByUserId(userId: string): Promise<Subscription | null>;
  save(subscription: Subscription): Promise<Subscription>;
  update(subscription: Subscription): Promise<Subscription>;
  expireOverdue(): Promise<number>;
}
