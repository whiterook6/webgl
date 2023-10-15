export class HashedSpaceIndex<T> {
  private buckets: T[][];

  constructor(bucketCount: number, bucketWidth: number, bucketHeight: number){
    this.buckets = new Array<T[]>(bucketCount);
    for (let i = 0; i < bucketCount; i++){
      this.buckets[i] = [];
    }
  }
  
  public hash(x: number, y: number){
    return (Math.floor(x) * 6079 + Math.floor(y)) % this.buckets.length;
  }

  public insert(value: T, x: number, y: number){
    this.buckets[this.hash(x, y)].push(value);
  }
  
  public getNearest(x: number, y: number, radius: number){
    const result: T[] = [];
    const bucketRadius = Math.ceil(radius);
    for (let i = -bucketRadius; i <= bucketRadius; i++){
      for (let j = -bucketRadius; j <= bucketRadius; j++){
        const bucket = this.buckets[this.hash(x + i, y + j)];
        
        // add all from bucket into result:
        result.push(...bucket);
      }
    }
    return result;
  }

  public move(value: T, oldX: number, oldY: number, newX: number, newY: number){
    const oldBucket = this.buckets[this.hash(oldX, oldY)];
    const newBucket = this.buckets[this.hash(newX, newY)];
    const index = oldBucket.indexOf(value);
    if (index !== -1){
      oldBucket.splice(index, 1);
      newBucket.push(value);
    }
  }
}