import { GymClass } from '../domain/entities/GymClass';

describe('GymClass Entity', () => {
  it('should create a gym class successfully', () => {
    const gymClass = new GymClass({
      name: 'CrossFit Morning',
      description: 'High intensity workout',
      instructor: 'Trainer Alex',
      capacity: 20,
    });

    expect(gymClass.name).toBe('CrossFit Morning');
    expect(gymClass.capacity).toBe(20);
  });

  it('should throw error if name is empty', () => {
    expect(() => {
      new GymClass({
        name: ' ',
        instructor: 'Trainer Alex',
        capacity: 20,
      });
    }).toThrow('Class name is required');
  });

  it('should correctly identify if the class is full', () => {
    const gymClass = new GymClass({
      name: 'Yoga',
      instructor: 'Trainer Zen',
      capacity: 10,
    });

    expect(gymClass.isFull(10)).toBe(true);
    expect(gymClass.isFull(5)).toBe(false);
  });
});
