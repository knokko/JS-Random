function Random(next){
	this.next = next;
}

Random.prototype.nextBoolean = function(){
	return this.next();
};

Random.prototype.nextByte = function(){
	return BitHelper.booleansToByte(this.next(), this.next(), this.next(), this.next(), this.next(), this.next(), this.next(), this.next());
};

Random.prototype.nextShort = function(){
	return BitHelper.makeShort(this.nextByte(), this.nextByte());
};

Random.prototype.nextChar = function(){
	return BitHelper.makeChar(this.nextByte(), this.nextByte());
};

Random.prototype.nextInt = function(bound){
	if(bound === undefined){
		return BitHelper.makeInt(this.nextByte(), this.nextByte(), this.nextByte(), this.nextByte());
	}
	const bits = BitHelper.getRequiredBits(bound - 1);
	let safetyCounter = 0;
	let result = 0;
	do {
		result = 0;
		const bools = this.nextBooleans(bits);
		for (let index = 0; index < bits; index++){
			if (bools[index]){
				result += BitHelper.POWERS[index];
			}
		}
		
		// Prevent freezes with broken random number generators
		safetyCounter++;
		if (safetyCounter > 50) {
			result -= bound;
			break;
		}
	} while(result >= bound);
	return result;
};

Random.prototype.nextBooleans = function(amount){
	const result = new Array(amount);
	for(let index = 0; index < amount; index++){
		result[index] = this.next();
	}
	return result;
};

Random.prototype.nextBytes = function(amount){
	const result = new Int8Array(amount);
	for(let index = 0; index < amount; index++){
		result[index] = this.nextByte();
	}
	return result;
};

Random.prototype.nextShorts = function(amount){
	const result = new Int16Array(amount);
	for(let index = 0; index < amount; index++){
		result[index] = this.nextShort();
	}
	return result;
};

Random.prototype.nextChars = function(amount){
	const result = new Uint16Array(amount);
	for(let index = 0; index < amount; index++){
		result[index] = this.nextChar();
	}
	return result;
};

Random.prototype.nextInts = function(amount){
	const result = new Array(amount);
	for(let index = 0; index < amount; index++){
		result[index] = this.nextInt();
	}
	return result;
};