function Node(value, params) {
    this.value = value;
    this.key = value;
    this.type = params.type;
    this.enabled = params.enabled;
    this.next = null;
    this.prev = null;
}

export function DoublyLinkedList () {
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
            node.prev = currentNode;
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
        node.prev = currentNode;
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
        let found = true;
        if(currentNode) {
            while(currentNode.value !== identifier) {
                previousNode = currentNode;
                currentNode = currentNode.next;
                if(!currentNode) {
                    found = false;
                    break;
                }
            }
            if(found) {
                previousNode.next = currentNode.next;
                currentNode.next.prev = previousNode;
                this._length--;
            }
        }
    }

    this.enable = (value) => {
        let currentNode = this.head;
        while(currentNode.value !== value) {
            currentNode = currentNode.next;
        }
        currentNode.enabled = true;
    }

    this.disable = (value) => {
        let currentNode = this.head;
        while(currentNode.value !== value) {
            currentNode = currentNode.next;
        }
        currentNode.enabled = false;
    }
}
