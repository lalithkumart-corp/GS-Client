class Node {
    constructor(val) {
        this.val = val;
        this.left = null;
        this.right = null;
    }
}
class GsBStree {
    constructor() {
        this.root = null;
    }
    insert(val) {
        let node = new Node(val);
        if(!this.root) this.root = node;
        else this.insertToNode(this.root, node);
    }
    insertToNode(destNode, node) {
        if(node.val < destNode.val){
            if(destNode.left)
                this.insertToNode(destNode.left, node)
            else
                destNode.left = node;
        } else {
            if(destNode.right)
                this.insertToNode(destNode.right, node)
            else
                destNode.right = node;
        }
    }
    search(val) {
        let found = this.searchForNode(this.root, val);
        console.log(found);
    }
    searchForNode(someNode, val) {
        if(!someNode) return null;
        if(someNode.val == val)
            return someNode;
        if(val > someNode.val)
            return this.searchForNode(someNode.right, val);
        else
            return this.searchForNode(someNode.left.val);
    }
}


let inst = new GsBStree()
inst.insert(30);
inst.insert(20);
inst.insert(40);
inst.insert(22);
inst.insert(25);
inst.insert(29);
inst.insert(39);

inst.insert(34);
inst.insert(31);
inst.insert(44);
inst.insert(10);
inst.insert(9);