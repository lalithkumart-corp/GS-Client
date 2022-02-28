function Node(value, params) {
    this.value = value;
    this.key = value;
    this.type = params.type;
    this.enabled = params.enabled;
    this.next = null;
}


export function SinglyLinkedList () {
    this._length = 0;
    this.head = null;
    this.add = (value, params) => {
        let node = new Node(value, params);
        let currentNode = this.head;
        this._length++;

        if (!currentNode) {// 1st use-case: an empty list 
            this.head = node;
        } else {
            while (currentNode.next) {// 2nd use-case: a non-empty list
                currentNode = currentNode.next;
            }
            currentNode.next = node;
        }
        //return node;
    }
    this.insertAfter = (identifier, value, params) => {
        let node = new Node(value, params);
        let currentNode = this.head;
        this._length++;

        while(currentNode.value !== identifier) {
            currentNode = currentNode.next;
        }
        
        node.next = currentNode.next;
        currentNode.next = node;
    }

    this.findNode = (value) => {
        let currentNode = this.head;
        while(currentNode.value !== value) {
            currentNode = currentNode.next;
        }
        return currentNode;
    }

    this.remove = (identifier) => {        
        let currentNode = this.head;
        let previousNode = null;
        while(currentNode.value !== identifier) {
            previousNode = currentNode;
            currentNode = currentNode.next;
        }
        previousNode.next = currentNode.next;
        this._length--;
    }
}





/*  TUTORIALS  */

function reverse(node) {
    if (!node || !node.next)
      return node; // If last node, then return
    let tmp = reverse(node.next);
    node.next.next = node;
    node.next = undefined;
    return tmp;
}
let inst = new SinglyLinkedList();
inst.add(10);
inst.add(101);
inst.add(123);
inst.add(145);
inst.add(199);
console.log(inst);
let reversedList = reverse(inst.head);
console.log(reversedList);
