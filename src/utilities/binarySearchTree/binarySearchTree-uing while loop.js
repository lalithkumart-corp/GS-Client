console.log('STARTING');
function Node(val) {
    this.value = val;
    this.left = null;
    this.right = null;
    this.count = 1;
}

class BST {
    constructor() {
        this.head = null;
    }
    insert(val) {
        let theNode = new Node(val);
        if(!this.head) {
            this.head = theNode;
        } else {
            let currentNode = this.head;
            while(val != currentNode.value) {
                if(val < currentNode.value) {
                    if(currentNode.left)
                        currentNode = currentNode.left;
                    else {
                        currentNode.left = theNode;
                        return;
                    }
                } else {
                    if(currentNode.right)
                        currentNode = currentNode.right;
                    else {
                        currentNode.right = theNode;
                        return;
                    }
                }
            }
            if(currentNode.value == val) {
                currentNode.count++;
                return;
            }
        }
    }
    search(val) {
        if(val) {
            let currentNode = this.head;
            while(val != currentNode.value) {
                if(val < currentNode.value) {
                    if(currentNode.left)
                        currentNode = currentNode.left;
                } else {
                    if(currentNode.right)
                        currentNode = currentNode.right;
                }
            }
            if(currentNode.value == val) {
                return currentNode;
            }
        } else {
            console.error('Search for valid value');
            return;
        }
    }
}

// let theBst = new BST();
// theBst.insert(10);
// theBst.insert(12);
// theBst.insert(7);
// theBst.insert(13);
// theBst.insert(45);
// theBst.insert(3);
// theBst.insert(1);
// theBst.insert(8);
// theBst.insert(4);
// theBst.insert(3);
// theBst.insert(90);
// theBst.insert(9);
// theBst.insert(7);
// theBst.insert(3);
// theBst.insert(3);
// console.log(theBst);

// let searchedNode = theBst.search(3);
// console.log(searchedNode);