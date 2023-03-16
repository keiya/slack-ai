export class RingBuffer<T> {
  private data: T[];
  private head: number = 0;
  private tail: number = 0;
  private size: number;

  constructor(size: number) {
    this.data = new Array<T>(size);
    this.size = size;
  }

  public enqueue(item: T): void {
    if (this.isFull()) {
      this.dequeue();
    }
    this.data[this.tail] = item;
    this.tail = (this.tail + 1) % this.size;
  }

  public dequeue(): T | undefined {
    if (this.isEmpty()) {
      return undefined;
    }
    const item = this.data[this.head];
    this.data[this.head] = null as any;
    this.head = (this.head + 1) % this.size;
    return item;
  }

  public peek(): T | undefined {
    if (this.isEmpty()) {
      return undefined;
    }
    return this.data[this.head];
  }

  public isFull(): boolean {
    return (this.tail + 1) % this.size === this.head;
  }

  public isEmpty(): boolean {
    return this.head === this.tail;
  }

  public getSize(): number {
    return this.size;
  }

  public toArray(): T[] {
    const result: T[] = [];
    for (let i = this.head; i !== this.tail; i = (i + 1) % this.size) {
      result.push(this.data[i]);
    }
    return result;
  }
}
