function RandomArray(sources){
	this.sources = sources;
	this.index = 0;
	this.counter = 0;
}

extendProtoType(Random, RandomArray);

RandomArray.prototype.clone = function(){
	const length = this.sources.length;
	const sources = new Array(this.sources.length);
	for (let index = 0; index < length; index++){
		sources[index] = this.sources[index].clone();
	}
	const clone = new RandomArray(sources);
	clone.index = this.index;
	clone.counter = this.counter;
	return clone;
};

RandomArray.prototype.next = function(){
	const result = this.sources[this.index].next();
	this.counter++;
	if(result){
		this.counter++;
	}
	if(this.counter === 81 || this.counter === 82){
		this.index = this.sources[this.index].nextInt(this.sources.length);
		this.counter = 0;
	}
	return result;
};

RandomArray.prototype.toString = function(){
	let string = '[';
	for(let index = 0; index < this.sources.length; index++){
		string += this.sources[index].toString() + ', ';
	}
	return string + ']';
};

function createPseudoRandomArray(bytes){
	const source = new Array(Math.ceil(bytes.length / 32));
	const newBytes = new Int8Array(source.length * 32);
	javaArrayCopy(bytes, 0, newBytes, 0, bytes.length);
	bytes = newBytes;
	const input = new BitHelper.ByteArrayBitInput(bytes);
	for(let index = 0; index < source.length; index++){
		source[index] = new PseudoRandom(input.readInt(), input.readInt(), input.readInt(), input.readInt(), input.readInt(), input.readInt(), input.readInt(), input.readInt());
	}
	return new RandomArray(source);
};