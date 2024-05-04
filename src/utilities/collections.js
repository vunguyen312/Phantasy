class Queue {

    constructor(){
        this.elements = {};
        this.frontIndex = 0;
        this.rearIndex = 0;
        this.size = 0;
    }

    enqueue(element){
        this.elements[this.rearIndex] = element;
        this.rearIndex++;
        this.size++;
    }

    dequeue(){
        const element = this.elements[this.frontIndex];
        delete this.elements[this.frontIndex];
        this.frontIndex++;
        this.size--;
        return element;
    }

    peek(){
        return this.items[this.frontIndex];
    }

    isEmpty(){
        return this.rearIndex - this.frontIndex === 0;
    }

    print(){
        console.log(this.elements);
    }
}

module.exports = {Queue}