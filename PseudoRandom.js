function PseudoRandom(seed1, seed2, seed3, seed4, seed5, seed6, seed7, seed8){
	this.replaceCounter = 0;
	this.shiftCounter = 0;
	this.data = new Array(256);
	this.setIntAt(0, seed1);
	this.setIntAt(32, seed2);
	this.setIntAt(64, seed3);
	this.setIntAt(96, seed4);
	this.setIntAt(128, seed5);
	this.setIntAt(160, seed6);
	this.setIntAt(192, seed7);
	this.setIntAt(224, seed8);
}

extendProtoType(Random, PseudoRandom);

PseudoRandom.prototype.parse = function(string){
	const result = new Array(string.length);
	for(let index = 0; index < string.length; index++){
		const c = string.charAt(index);
		if(c === '1'){
			result[index] = true;
		}
		else if(c === '0'){
			result[index] = false;
		}
		else {
			throw 'Invalid string: ' + string;
		}
	}
	return result;
};

PseudoRandom.prototype.toString = function(){
	let string = 'PR[';
	for(let index = 0; index < this.data.length; index++){
		string += this.data[index] ? '1' : '0';
	}
	return string + ']';
};

PseudoRandom.prototype.INDEX = 77;

PseudoRandom.prototype.SHIFTER = 214;

PseudoRandom.prototype.HARD_MASK = PseudoRandom.prototype.parse('1101000101001000010011100000101000000101100011101001010100000010001000100100111101011100001001111011010110011100001001010010011111100001010010010001101010000110101111011010100011001000100100111100010001100010110011001001000010100101001011110111110011011100');

PseudoRandom.prototype.next = function(){
	const oldIndex = this.getIndex();
	const result = this.data[oldIndex];
	this.xor(oldIndex, this.HARD_MASK);
	this.shift(this.getAt(this.SHIFTER) + 50);
	this.replace(this.getIndex() + 69, result);
	this.shift(this.getAt(this.getIndex() - 22) + this.shiftCounter++);
	this.invert(this.getAt(this.getIndex() + 17));
	this.setIndex(this.getAt(this.getIndex() - 96));
	return result;
};

PseudoRandom.prototype.setIntAt = function(index, value){
	this.setAt(index, BitHelper.byteToBooleans(BitHelper.int0(value)));
	this.setAt(index + 8, BitHelper.byteToBooleans(BitHelper.int1(value)));
	this.setAt(index + 16, BitHelper.byteToBooleans(BitHelper.int2(value)));
	this.setAt(index + 24, BitHelper.byteToBooleans(BitHelper.int3(value)));
};

PseudoRandom.prototype.setAt = function(index, value){
	//console.log('PseudoRandom.setAt(' + index + ',' + value + ')');
	if(!Array.isArray(value)){
		value = BitHelper.byteToBooleans(value - 128);
	}
	while(index < 0){
		index += 256;
	}
	while(index >= 256){
		index -= 256;
	}
	const copyAmount = 256 - index;
	if(copyAmount >= value.length){
		javaArrayCopy(value, 0, this.data, index, value.length);
		//console.log(index + 'set data to ' + this.data);
	}
	else {
		javaArrayCopy(value, 0, this.data, index, copyAmount);
		javaArrayCopy(value, copyAmount, this.data, 0, value.length - copyAmount);
	}
};

PseudoRandom.prototype.getAt = function(index, length){
	if(length === undefined){
		return BitHelper.booleansToByte(this.getAt(index, 8)) + 128;
	}
	while(index < 0){
		index += 256;
	}
	while(index >= 256){
		index -= 256;
	}
	const result = new Array(length);
	const copyAmount = 256 - index;
	if(copyAmount >= length){
		javaArrayCopy(this.data, index, result, 0, length);
	}
	else {
		javaArrayCopy(this.data, index, result, 0, copyAmount);
		javaArrayCopy(this.data, 0, result, copyAmount, length - copyAmount);
	}
	return result;
};

PseudoRandom.prototype.getIndex = function(){
	return this.getAt(this.INDEX);
};

PseudoRandom.prototype.setIndex = function(index){
	this.setAt(this.INDEX, index);
};

PseudoRandom.prototype.xor = function(index, mask){
	let maskIndex = 0;
	for(; maskIndex + index < 256; maskIndex++){
		if(mask[maskIndex]){
			this.data[index + maskIndex] = !this.data[index + maskIndex];
		}
	}
	for(; maskIndex < 256; maskIndex++){
		if(mask[maskIndex]){
			this.data[index + maskIndex - 256] = !this.data[index + maskIndex - 256];
		}
	}
};

PseudoRandom.prototype.shift = function(direction){
	const copy = this.data.slice(0, 256);
	this.setAt(direction, copy);
};

PseudoRandom.prototype.replace = function(baseIndex, value){
	if(this.replaceCounter <= 0){
		const firstIndices = new Array(32);
		for(let i = 0; i < 32; i++){
			firstIndices[i] = this.getAt(baseIndex + i * 8);
		}
		const secondIndices = new Array(256);
		for(let i = 0; i < 32; i++){
			secondIndices[i * 8 + 0] = this.getAt(firstIndices[i] + 0);
			secondIndices[i * 8 + 1] = this.getAt(firstIndices[i] + 23);
			secondIndices[i * 8 + 2] = this.getAt(firstIndices[i] + 143);
			secondIndices[i * 8 + 3] = this.getAt(firstIndices[i] + 12);
			secondIndices[i * 8 + 4] = this.getAt(firstIndices[i] - 74);
			secondIndices[i * 8 + 5] = this.getAt(firstIndices[i] - 213);
			secondIndices[i * 8 + 6] = this.getAt(firstIndices[i] + 176);
			secondIndices[i * 8 + 7] = this.getAt(firstIndices[i] + 58);
		}
		const copy = this.data.slice(0, 256);
		for(let index = 0; index < 256; index++){
			this.data[index] = copy[secondIndices[index]];
		}
		this.replaceCounter = 29;
	}
	else {
		this.replaceCounter--;
		if(value){
			this.replaceCounter--;
		}
	}
};

PseudoRandom.prototype.invert = function(index){
	const bools = this.getAt(index, 15);
	for(let i = 0; i < bools.length; i++){
		bools[i] = !bools[i];
	}
	this.setAt(index, bools);
};

PseudoRandom.prototype.getData = function(){
	return this.data.slice(0, 256);
};