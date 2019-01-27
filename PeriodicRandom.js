function PeriodicRandom(backer, bufferSize, period){
    this.backer = backer;
    this.buffer = new Array(bufferSize);
    this.period = period;
    this.counter = 0;
    this.index = 0;
    this.refresh();
}

extendProtoType(Random, PeriodicRandom);

PeriodicRandom.prototype.refresh = function(){
    const buffer = this.buffer;
    const length = buffer.length;
    const backer = this.backer;
    for (let index = 0; index < length; index++){
        buffer[index] = backer.next();
    }
};

PeriodicRandom.prototype.clone = function(){
    const clone = new PeriodicRandom(this.backer.clone, this.buffer.length, this.period);
    clone.counter = this.counter;
    clone.index = this.index;
    javaArrayCopy(this.buffer, 0, clone.buffer, 0, this.buffer.length);
    return clone;
};

PeriodicRandom.prototype.next = function(){
    if (this.index < this.buffer.length){
        return this.buffer[this.index++];
    }
    this.counter++;
    this.index = 0;
    if (this.counter >= this.period){
        this.refresh();
        this.counter = 0;
    }
    return this.buffer[0];
};